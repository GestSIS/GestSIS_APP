import { computed } from "vue";
import { useStore } from "vuex";

const useHasPermission = function (permission) {
    const store = useStore();
    return computed(
        () =>
            store.state.auth.admin ||
            store.state.auth.sis.permissions.includes(permission),
    );
}

export default useHasPermission;