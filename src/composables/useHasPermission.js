import { computed } from "vue";
import { useAuthStore } from "../stores/auth/Auth";

const useHasPermission = function (permissions) {
  const authStore = useAuthStore();
  if (typeof permissions === "string") {
    return computed(() => authStore.organisation.permissions.includes(permissions));
  } else {
    return computed(() => permissions.some((p) => authStore.organisation.permissions.includes(p)));
  }
};

export default useHasPermission;
