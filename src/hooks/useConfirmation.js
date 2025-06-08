import { useModalStore } from "../stores/common/Modal";

const useConfirmation = function () {
    return {
        confirm: (title, question) => {
            return new Promise((resolve, reject) => {
                const { showModal } = useModalStore();
                showModal({
                    component: 'ModalConfirmation',
                    data: {
                        title: title,
                        question: question,
                    },
                    callback: (confirmed) => {
                        if (confirmed) {
                            resolve()
                        } else {
                            reject();
                        }
                    },
                });
            })
        }
    }
}

export default useConfirmation;