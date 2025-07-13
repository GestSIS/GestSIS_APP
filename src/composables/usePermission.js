import { computed } from "vue";
import { useStore } from "vuex";

const useHasPermission = function (permissions) {
    const store = useStore();
    if (typeof (permissions) === 'string') {
        return computed(
            () =>
                store.state.auth.admin ||
                store.state.auth.sis.permissions.includes(permissions),
        );
    } else {
        return computed(
            () =>
                store.state.auth.admin ||
                permissions.some((p) => store.state.auth.sis.permissions.includes(p))
        );

    }
}

export default useHasPermission;