import create from "zustand";
import produce from "immer";

const createWithImmer = storeCreator =>
  create(originalSet => storeCreator(fn => originalSet(produce(fn))));

const up = state => {
  state.nested.stuff.is.here++;
};

const upBy = n => state => {
  state.nested.stuff.is.here += n;
};

const [useStore] = createWithImmer(set => ({
  nested: { stuff: { is: { here: 0 } } },
  up: () => set(up),
  upBy: n => set(upBy(n))
}));

export default useStore;
