import { batch, mergeProps } from "solid-js";
import { createStore, unwrap, produce, reconcile } from "solid-js/store";
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import { connection, reportBadConnection } from 'lib/api';
import { uuidv4, jClone } from 'lib/utils';

export function gritsTypeStr(grits) {
  return `batch: [${grits.map(w => w?.type || 'no-op').join(', ')}]`;
}

export function getPool(wash, hydrate, apiSendWave, options = {}) {
  const [pool, $pool] = createStore({
    real: null, // the state as confirmed by the server
    fake: null, // the state as predicted by our pulses/charges
    pulses: [], // grits that have been sent but not confirmed
    charges: [], // goals/grits to be sent in the next batch
  });

  if (!hydrate) {
    hydrate = (arg) => arg;
  }
  let filters = options.filters ?? {};
  let preFilters = options.preFilters ?? {};

  let firstChargeTimer = null;
  let lastChargeTimer = null;

  return mergeProps(pool, {
    $: $pool,

    get minBatchLatency() {
      return options.minBatchLatency || 300;
    },

    get maxBatchLatency() {
      return options.maxBatchLatency || 1200;
    },

    sendWave(type, arg, batch = true) {
      let charge = this.filterGoals(this.fake, [{ type, arg }], true);
      if (!charge) return false;
      if (batch) {
        this.addCharge(charge, false);
      } else {
        const {goals, grits} = charge;
        const uuid = uuidv4();
        console.log('sending goals', gritsTypeStr(goals), ', predicting grits', gritsTypeStr(grits), 'with id', uuid ? uuid.substring(0, 4) : uuid);
        this.addPulse({
          id: uuid,
          src: our,
          wen: Date.now(),
          grits,
        }, false);
        this.sendWavePoke(goals, uuid);
      }
      return true;
    },

    async sendWavePoke(goals, uuid, retries = 0) {
      try {
        // if (['active', 'reconnected'].includes(connection())) {
        return await apiSendWave(goals, uuid);
        // } else {
        //   throw new Error('No connection to ship');
        // }
      } catch (e) {
        if (e?.message === 'Failed to fetch') {
          // internet connectivity issue
          if (retries < 4) { // 15 seconds before pulse is discarded (1+2+4+8)
            const now = Date.now();
            const timeout = Math.pow(2, retries)*1000;
            retries++;
            console.warn(`Failed to send wave, attempting retry #${retries} in ${timeout/1000}s`);
            // await api.eventSource();
            setTimeout(() => this.sendWavePoke(goals, uuid, retries), Math.max(0, timeout - (Date.now() - now)));
          } else {
            console.warn('Failed to send wave, no more retries, rolling back');
            this.removePulse(uuid);
            this.replayFake();
          }
        } else {
          console.warn('Failed to send wave, can\'t retry, rolling back');
          if (e?.message === 'Failed to PUT channel') {
            reportBadConnection();
          }
          this.removePulse(uuid);
          this.replayFake();
        }
      }
    },

    onRes(res) {
      batch(() => {
        if (!res) {
          // TODO: cancel sub or something
          options.onErr?.();
        } else if (res.hasOwnProperty('rock')) {
          const newCore = hydrate(res.rock.core);
          console.log(`new core with id ${newCore?.id} from rock`, newCore);
          console.log(`stir ids for ${newCore?.id} rock:`, res.rock.stirIds);
          if (!res.rock.stirIds[our]) {
            options.onNew?.();
          }
          this.updateReal(reconcile(newCore, { merge: true }));
          this.updatePulses(false, res.rock.stirIds[our]); // always resets ether because grit is undefined
          console.log('leftover pulses: ', this.pulses.length);
          options.onNewRock?.(res.rock.core);
        } else if (res.hasOwnProperty('wave')) {
          const { grits, id, src, wen } = res.wave;
          console.log(`getting wave for ${this.real?.id}`, gritsTypeStr(grits), 'with id', (id ? id.substring(0, 4) : id), 'src', src, 'wen', wen);
          const noop = !grits || grits.length === 0;
          const noPulses = this.pulses.length === 0;
          const noCharges = this.charges.length === 0;
          
          if (!noop) {
            wash(this.updateReal.bind(this), grits, src, wen);
            options.onNewGrits?.(grits);
          }
          if (!noop && noPulses && noCharges) {
            wash(this.updateFake.bind(this), grits, src, wen);
          } else {
            this.updatePulses(noop, id, src, wen, grits);
          }
        } else {
          console.error('Pool response not a rock or wave???', res);
        }
      });
    },

    applyGrits(grits, src, wen) {
      wash(this.updateFake.bind(this), grits, src, wen);
    },
  
    addPulse(pulse, apply = true) {
      batch(() => {
        this.$('pulses', (pulses) => [...pulses, pulse]);
        if (apply) this.applyPulse(pulse);
      });
    },
  
    applyPulses() {
      this.pulses.forEach((pulse) => {
        this.applyPulse(pulse);
      });
    },
  
    applyPulse(pulse) {
      this.applyGrits(pulse.grits, pulse.src, pulse.wen);
    },
  
    removePulse(uuid) {
      const pulseI = this.pulses.findIndex(p => p.id === uuid);
      this.$('pulses', p => [...p.slice(0, pulseI), ...p.slice(pulseI + 1)]);
    },
  
    removePulses() {
      this.$('pulses', []);
    },
  
    updatePulses(noop, id, src, wen, grits) {
      const pulseI = !id ? -1 : this.pulses.findIndex(p => p.id === id);
      const matches = pulseI >= 0;
      const matchesFirst = pulseI === 0;
      const confirms = !noop && matches && isEqual(jClone(this.pulses[pulseI].grits), grits);
      const changesSomething = !noop || matches;
      const fakeInvalidated = changesSomething && !(matchesFirst && confirms);
      if (matches) {
        // once we can guarantee that pokes are send to ship in order,
        // we can throw out any pulses before the matched one
        // this.$('pulses', p => [...p.slice(0, pulseI), ...p.slice(pulseI + 1)]);
        if (!confirms) console.log('DID NOT CONFIRM\nDID NOT CONFIRM');
        if (pulseI > 0) console.log(`THROWING AWAY ${pulseI} UNMATCHED PULSE(S)`);
        this.$('pulses', p => p.slice(pulseI + 1));
      }
      if (fakeInvalidated) {
        this.replayFake();
      }
    },
  
    addCharge(charge, apply = true) {
      // console.log('adding charge')
      if (this.charges.length == 0) {
        this.setFirstChargeTimer();
      }
      this.setLastChargeTimer();
      batch(() => {
        this.$('charges', (charges) => [...charges, charge]);
        if (apply) this.applyCharge(charge);
      });
    },
  
    setFirstChargeTimer() {
      if (firstChargeTimer) {
        clearTimeout(firstChargeTimer);
      }
      firstChargeTimer = setTimeout(() => {
        // console.log(`at least ${this.maxBatchLatency}ms since first charge; firing`);
        if (this.charges.length >= 1) {
          this.fireCharges();
        }
      }, this.maxBatchLatency);
    },
  
    setLastChargeTimer() {
      if (lastChargeTimer) {
        clearTimeout(lastChargeTimer);
      }
      lastChargeTimer = setTimeout(() => {
        // console.log(`at least ${this.minBatchLatency}ms since last charge; firing`);
        if (this.charges.length >= 1) {
          this.fireCharges();
        }
      }, this.minBatchLatency);
    },
  
    applyCharges() {
      this.charges.forEach((charge) => {
        this.applyCharge(charge);
      });
    },
  
    applyCharge(charge) {
      this.applyGrits(charge.grits, our, Date.now());
    },
  
    fireCharges() {
      batch(() => {
        if (firstChargeTimer)
          clearTimeout(firstChargeTimer);
        if (lastChargeTimer)
          clearTimeout(lastChargeTimer);
        let goals = [], grits = [];
        this.charges.forEach(c => {
          goals = [...goals, ...c.goals]
          grits = [...grits, ...c.grits]
        });
        const uuid = uuidv4();
        console.log('sending goals', gritsTypeStr(goals), ', predicting grits', gritsTypeStr(grits), 'with id', uuid ? uuid.substring(0, 4) : uuid);
        this.$('charges', []);
        this.addPulse({
          id: uuid,
          src: our,
          wen: Date.now(),
          grits,
        }, false); // don't apply because charges were already applied
        this.sendWavePoke(goals, uuid);
      });
    },
  
    resetFake() {
      // console.log('resetting fake');
      const realCopy = hydrate(cloneDeep(pool.real));
      this.$('fake', reconcile(realCopy, { merge: true }));
    },
  
    replayFake() {
      console.log('replaying fake');
      batch(() => {
        this.resetFake();
        this.applyPulses();
        this.applyCharges();
      });
    },
  
    updateReal(fun) {
      // console.log('updating base core')
      batch(() => {
        // if (pool.real && !pool.real.id) this.$('real', 'id', this.id);
        this.$('real', fun);
      });
    },
    
    updateFake(fun) {
      // console.log('updating fake core')
      batch(() => {
        // if (this.fake && !this.fake.id) this.$('fake', 'id', this.id);
        this.$('fake', fun);
      });
    },

    // returns false if goal is rejected
    // otherwise, returns {goals, grits}
    filterGoals(rock, goals, apply = false) {
      let [temp, $temp] = [rock, this.updateFake.bind(this)];
      if (!apply) [temp, $temp] = createStore(hydrate(cloneDeep(rock)));
      goals = goals.map(g => this.preFilterGoal(temp, g)).filter(g => g);
      let newGoals = [], grits = [], roars = [];
      goals.forEach((goal) => {
        const res = this.fGoals(temp, $temp, [goal]);
        if (res.grits.length || res.roars.length) {
          newGoals.push(goal);
          grits = [...grits, ...res.grits];
          roars = [...roars, ...res.roars];
        }
      });
      if (options.onNewRoars) options.onNewRoars(roars);
      if (options.onNewFakeGrits) options.onNewFakeGrits(grits);
      if (!newGoals.length) return false;
      return {
        goals: newGoals,
        grits,
      };
    },

    fGoals(rock, $rock, goals, distToTop = 0, depth = 0) {
      let roars = [], grits = [];
      function ret() {
        return {
          roars,
          grits,
        };
      }
      if (goals.length === 0) return ret();
      const top = distToTop === 0;
      if (top) depth = 0;
      if (depth > 20) return ret();
      const goal = goals[0];
      const filtered = this.filterGoal(rock, goal, top);
      wash($rock, filtered.grits, our, Date.now());
      const restGoals = [...filtered.goals, ...goals.slice(1)];
      depth += filtered.goals.length;
      distToTop = Math.max(0, distToTop - 1) + filtered.goals.length;
      const rest = this.fGoals(rock, $rock, restGoals, distToTop, depth);
      roars = [...filtered.roars, ...rest.roars];
      grits = [...filtered.grits, ...rest.grits];
      return ret();
    },

    preFilterGoal(rock, goal) {
      if (preFilters[goal.type]) {
        return preFilters[goal.type](rock, goal);
      }
      return goal;
    },

    filterGoal(rock, goal, top = true) {
      if (filters[goal.type]) {
        const res = filters[goal.type](rock, goal, top);
        if (res instanceof Array) {
          return {
            roars: [],
            grits: res,
            goals: [],
          };
        }
        return {
          roars: res.roars,
          grits: res.grits,
          goals: res.goals,
        };
      }
      return {
        roars: [],
        grits: [goal],
        goals: [],
      };
    },
  });
}
