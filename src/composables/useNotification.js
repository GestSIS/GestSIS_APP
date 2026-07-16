import AWN from "awesome-notifications";
import { reactive } from "vue";

const state = reactive({
  awn: new AWN.default({
    labels: {
      success: "Succès",
      warning: "Attention",
      alert: "Erreur",
    },
  }),
});

export default function useNotification() {
  return state.awn;
}
