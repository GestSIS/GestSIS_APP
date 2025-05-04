import { useStore } from 'vuex';

function useModal() {
    const store = useStore();
    const closeModal = () => store.commit('HIDE_MODAL')
    const showModal = (options) => store.commit('SHOW_MODAL', options)

    return { closeModal, showModal }
}

export default useModal;
