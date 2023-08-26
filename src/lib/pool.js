import { batch, mergeProps } from "solid-js";
import { createStore, unwrap, produce, reconcile } from "solid-js/store";
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import { uuidv4, jClone } from 'lib/utils';

export function gritsTypeStr(grits) {
  return `batch: [${grits.map(w => w?.type || 'no-op').join(', ')}]`;
}

export function getPool(wash, hydrate, apiSendWave, filters, options = {}) {
  const [pool, $pool] = createStore({
    real: null, // the state as confirmed by the server
    fake: null, // the state as predicted by our pulses/charges
    pulses: [], // grits that have been sent but not confirmed
    charges: [], // goals/grits to be sent in the next batch
  });

  if (!hydrate) {
    hydrate = (arg) => arg;
  }
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
      let charge = this.filterGoals(this.fake, [{ type, arg }]);
      if (!charge) return false;
      if (batch) {
        this.addCharge(charge);
      } else {
        const {goals, grits} = charge;
        const uuid = uuidv4();
        console.log('sending grits', gritsTypeStr(grits), 'with id', uuid ? uuid.substring(0, 4) : uuid);
        this.addPulse({
          id: uuid,
          grits,
        });
        this.sendWavePoke(goals, uuid);
      }
      return true;
    },

    async sendWavePoke(goals, uuid, retries = 0) {
      try {
        await apiSendWave(goals, uuid);
      } catch (e) {
        if (e?.message === 'Failed to fetch') {
          // internet connectivity issue
          if (retries < 4) { // 15 seconds before pulse is discarded (1+2+4+8)
            const timeout = Math.pow(2, retries)*1000;
            retries++;
            console.warn(`Failed to send wave, attempting retry #${retries} in ${timeout/1000}s`);
            setTimeout(() => this.sendWavePoke(goal, uuid, retries), timeout);
          } else {
            console.warn('Failed to send wave, no more retries, rolling back');
            this.removePulse(uuid);
            this.replayFake();
          }
        } else {
          console.warn('Failed to send wave, can\'t retry, rolling back');
          this.removePulse(uuid);
          this.replayFake();
        }
      }
    },

    onRes(res) {
      batch(() => {
        if (res.hasOwnProperty('rock')) {
          const newCore = hydrate(res.rock.core);
          console.log(`new core with id ${newCore?.id} from rock`, newCore);
          this.updateReal(reconcile(newCore, { merge: true }));
          this.updatePulses(false, res.rock.stirIds[our]); // always resets ether because grit is undefined
          console.log('leftover pulses: ', this.pulses.length);
        } else if (res.hasOwnProperty('wave')) {
          const { grits, id } = res.wave;
          console.log(`getting wave for ${this.real?.id}`, gritsTypeStr(grits), 'with id', id ? id.substring(0, 4) : id);
          const noop = !grits || grits.length === 0;
          const noPulses = this.pulses.length === 0;
          const noCharges = this.charges.length === 0;
          
          if (!noop) {
            wash(this.updateReal.bind(this), grits);
          }
          if (!noop && noPulses && noCharges) {
            wash(this.updateFake.bind(this), grits);
          } else {
            this.updatePulses(noop, id, grits);
          }
        } else {
          console.error('Pool response not a rock or wave???', res);
        }
      });
    },

    applyGrits(grits) {
      wash(this.updateFake.bind(this), grits);
    },
  
    addPulse(pulse, apply = true) {
      batch(() => {
        this.$('pulses', (pulses) => [...pulses, pulse]);
        if (apply) this.applyGrits(pulse.grits);
      });
    },
  
    applyPulses() {
      this.pulses.forEach((pulse) => {
        this.applyGrits(pulse.grits);
      });
    },
  
    removePulse(uuid) {
      const pulseI = this.pulses.findIndex(p => p.id === uuid);
      this.$('pulses', p => [...p.slice(0, pulseI), ...p.slice(pulseI + 1)]);
    },
  
    removePulses() {
      this.$('pulses', []);
    },
  
    updatePulses(noop, id, grits) {
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
        if (apply) this.applyGrits(charge.grits);
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
        this.applyGrits(charge.grits);
      });
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
        console.log('sending grits', gritsTypeStr(grits), 'with id', uuid ? uuid.substring(0, 4) : uuid);
        this.$('charges', []);
        this.addPulse({
          id: uuid,
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

    // returns false if wave is rejected
    // otherwise, returns {goals, grits}
    filterGoals(rock, goals) {
      const [temp, $temp] = createStore(hydrate(cloneDeep(rock)));
      const newGoals = [], grits = [];
      goals.forEach((goal) => {
        const filtered = this.filterGoal(temp, goal);
        if (filtered) {
          newGoals.push(filtered.goal);
          grits.push(filtered.grit);
          wash($temp, [filtered.grit]);
        }
      });

      if (!grits.length) return false;
      return {
        goals: newGoals,
        grits,
      };
    },

    filterGoal(rock, goal) {
      if (filters[goal.type]) {
        const goalGrit = filters[goal.type](rock, goal);
        if (!goalGrit) return false;
        if (goalGrit instanceof Array) {
          return { goal: goalGrit[0], grit: goalGrit[1] };
        }
        return { goal: goalGrit, grit: goalGrit };
      }
      return { goal: goal, grit: goal };
    },
  });
}
