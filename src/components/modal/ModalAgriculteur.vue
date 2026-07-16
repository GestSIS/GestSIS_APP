<script setup>
import { computed, reactive, ref } from "vue";
import { useModalStore } from "../../stores/common/Modal.js";
import RtaService from "../../services/RtaService.js";

const { data, callback } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
  callback: {
    type: Function,
    default: () => {},
  },
});

const errors = ref({});
const form = reactive({
  ...data.agriculteur,
  capacites: data.agriculteur.capacites?.map((g) => ({ ...g })) ?? [{ numero: "" }],
  moyens_contact: data.agriculteur.moyens_contact?.map((m) => ({ ...m })) ?? [
    { type: "Privé", numero: "" },
  ],
});

const communes = computed(() => [...data.communes].map((c) => ({ id: c, designation: c })));
const ajoutMoyenContact = () => form.moyens_contact.push({ type: "Portable", numero: "" });
const supprimerMoyenContact = (tel) => {
  form.moyens_contact = form.moyens_contact.filter((c) => c !== tel);
};

const ajoutCapacite = () => form.capacites.push({ capacite: 0 });
const supprimerCapacite = (capacite) => {
  form.capacites = form.capacites.filter((g) => g !== capacite);
};

const { closeModal } = useModalStore();
const save = async () => {
  const action = form.id ? RtaService.updateAgriculteur : RtaService.createAgriculteur;
  form.moyens_contact = form.moyens_contact
    .sort((m1, m2) => {
      const o = (type) => types.find((t) => t.id === type)?.order ?? 99;
      return o(m1.type) - o(m2.type);
    })
    .map((g, i) => ({
      ...g,
      tri: i + 1,
    }));
  const { data } = await action(form);
  callback(data);
  closeModal();
};

const types = [
  { designation: "Mobile", id: "Mobile", order: 1 },
  { designation: "Privé", id: "Privé", order: 2 },
  { designation: "Prof", id: "Prof", order: 3 },
];
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 class="modal-title">{{ form.id ? "Modifier" : "Ajouter" }} un agriculteur</h5>
      <button type="button" class="btn-close" aria-label="Fermer" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="agriculteur">Agriculteur</label>
        <input
          id="agriculteur"
          v-model="form.agriculteur"
          required
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['agriculteur'] }"
        />
      </div>
      <div class="mb-3">
        <label for="lieudit">Lieu-dit</label>
        <input
          id="lieudit"
          v-model="form.lieudit"
          type="lieudit"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['lieudit'] }"
        />
      </div>
      <base-select v-model="form.communes" class="mb-3" label="Commune(s)" :options="communes" />
      <div class="mb-3">
        <label>Capacités</label>
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Capacités</th>
              <th v-if="form.capacites.length > 1"></th>
            </tr>
          </thead>
          <tbody v-for="(capacite, index) in form.capacites">
            <tr>
              <td>
                <div class="input-group input-group-sm">
                  <input
                    v-model="capacite.capacite"
                    required
                    type="adresse"
                    class="form-control form-control-sm"
                    :class="{
                      'is-invalid': errors['capacites[' + index + '].capacite'],
                    }"
                  />
                  <span class="input-group-text">litres</span>
                </div>
              </td>
              <td v-if="form.capacites.length > 1">
                <button
                  type="button"
                  class="btn btn-sm btn-outline-danger"
                  @click="supprimerCapacite(capacite)"
                >
                  <font-awesome-icon :icon="['far', 'trash-alt']" />
                </button>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td :colspan="form.capacites.length > 1 ? 2 : 1">
                <button type="button" class="btn btn-sm btn-outline-primary" @click="ajoutCapacite">
                  <font-awesome-icon :icon="['fas', 'plus']" />
                </button>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div class="mb-3">
        <label>Moyens de contact</label>
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Type</th>
              <th>Numéro</th>
              <th></th>
            </tr>
          </thead>
          <tbody v-for="(moyenContact, index) in form.moyens_contact">
            <tr>
              <td>
                <base-select
                  v-model="moyenContact.type"
                  :options="types"
                  :required="true"
                  :class="{
                    'is-invalid': errors['moyen_contacts[' + index + '].type'],
                  }"
                />
              </td>
              <td>
                <input
                  v-model="moyenContact.numero"
                  required
                  placeholder="+41 ..."
                  type="adresse"
                  class="form-control form-control-sm"
                  :class="{
                    'is-invalid': errors['moyens_contact[' + index + '].numero'],
                  }"
                />
              </td>
              <td>
                <button
                  v-if="form.moyens_contact.length > 1"
                  type="button"
                  class="btn btn-sm btn-outline-danger"
                  @click="supprimerMoyenContact(moyenContact)"
                >
                  <font-awesome-icon :icon="['far', 'trash-alt']" />
                </button>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4">
                <button
                  v-if="form.moyens_contact.length < 3"
                  type="button"
                  class="btn btn-sm btn-outline-primary"
                  @click="ajoutMoyenContact"
                >
                  <font-awesome-icon :icon="['fas', 'plus']" />
                </button>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
    <div class="modal-footer">
      <button autofocus type="button" class="btn btn-secondary" @click="closeModal(false)">
        Annuler
      </button>
      <button type="submit" class="btn btn-primary">
        {{ form.id ? "Modifier" : "Ajouter" }}
      </button>
    </div>
  </form>
</template>
