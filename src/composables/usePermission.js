import { computed } from "vue";
import { useAuthStore } from "../stores/auth/Auth";

const useHasPermission = function (permissions) {
    const authStore = useAuthStore();
    if (typeof (permissions) === 'string') {
        return computed(
            () =>
                authStore.admin ||
                authStore.sis.permissions.includes(permissions),
        );
    } else {
        return computed(
            () =>
                authStore.admin ||
                permissions.some((p) => authStore.sis.permissions.includes(p))
        );

    }
}

export default useHasPermission;