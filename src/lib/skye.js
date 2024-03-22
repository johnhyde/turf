// import { createMemo, createResource } from "solid-js";
import { createStore, produce, reconcile } from "solid-js/store";
import * as api from 'lib/api.js';

export class Skye { // we use a class so we can put it inside a store without getting proxied
  constructor(id, stirMark) {
    const [skye, $skye] = createStore({});
    this.skye = skye;
    this.$skye = $skye;
    this.id = id || '/closet';
    this.stirMark = stirMark || 'closet-stir';
    this.sub = null;
    this.subscribe();
  }

  async subscribe() {
    const onErr = () => {};
    const onQuit = () => {
      this.subscribe();
    };
    const onGrit = (grit) => {
      this.wash(grit);
    };
    this.sub = await api.subscribeToPool(this.id, onGrit, onErr, onQuit);
  }
  async unsubscribe() {
    await api.unsubscribeToPool(this.id);
  }

  async destroy() {
    return this.unsubscribe();
  }

  wash(grit) {
    switch (grit.type) {
      case 'set': {
        this.$skye(reconcile(grit.arg.skye));
        break;
      }
      case 'add-form': {
        this.$skye(grit.arg.formId, grit.arg.form);
        break;
      }
      case 'del-form': {
        this.$skye(grit.arg.formId, undefined);
        break;
      }
      default: {
        console.warn('unhandled closet-grit', grit);
      }
    }
  }

  sendStir(type, arg) {
    // very optimistic
    this.wash({ type, arg });
    return api.api.poke({
      app: 'turf',
      mark: this.stirMark,
      json: {
        [type]: arg,
      },
      onError: (e) => {
        console.error('caught error in sending skye stir', this.stirMark, e);
        // debugger;
      },
    });
  }

  // form should look like: { formId, form: { collidable, etc } }
  addForm(form, delFormId) {
    if (delFormId) this.delForm(delFormId);
    if (form) return this.sendStir('add-form', form);
  }

  delForm(formId) {
    if (window.confirm(`Do you want to permanently delete the item: ${formId}?`)) {
      return this.sendStir('del-form', { formId });
    }
  }
}
