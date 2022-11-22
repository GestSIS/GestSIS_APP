<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Contrôles médicaux</h3>
    </div>
    <!-- /.card-header -->
    <!-- form start -->
    <form role="form">
      <div class="card-body">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Type</th>
              <th>Médecin</th>
              <th>Consultation</th>
              <th>Validité</th>
              <th>Désignation</th>
              <th class="text-center">Accepté</th>
              <th class="text-center">En cours</th>
              <th>Doc</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="controles.length <= 0">
              <td colspan="8">Aucun contrôle médical</td>
            </tr>
            <tr v-for="c in controles" :key="c.id">
              <td>
                {{
                  c.controle_medical_type_id
                    ? types.find((l) => l.id == c.controle_medical_type_id)
                        ?.designation
                    : ''
                }}
              </td>
              <td>
                {{
                  c.medecin_id
                    ? medecins.find((l) => l.id == c.medecin_id)?.designation
                    : ''
                }}
              </td>
              <td>{{ c.consultation }}</td>
              <td>{{ c.validite }}</td>
              <td>{{ c.designation }}</td>
              <td class="text-center">
                <input
                  :id="'accepte_' + c.id"
                  type="checkbox"
                  class="form-check-input"
                  :checked="c.accepter"
                  disabled
                />
                <label
                  class="form-check-label"
                  :for="'accepte_' + c.id"
                ></label>
              </td>
              <td class="text-center">
                <input
                  :id="'en_cours_' + c.id"
                  type="checkbox"
                  class="form-check-input"
                  :checked="c.en_cours"
                  disabled
                />
                <label
                  class="form-check-label"
                  :for="'en_cours_' + c.id"
                ></label>
              </td>
              <td>
                <button
                  v-if="c.filename"
                  class="btn"
                  @click="downloadJustificatif(c)"
                >
                  <font-awesome-icon :icon="['far', 'file-pdf']" />
                </button>
              </td>
              <td>
                {{
                  c.localite_id
                    ? localites.find((l) => l.id == c.localite_id)?.designation
                    : ''
                }}
              </td>
              <td v-if="hasEditPermission">
                <div class="d-flex justify-content-center">
                  <button
                    type="button"
                    class="btn btn-outline-primary border-0"
                    @click="editMutation(c.id)"
                  >
                    <font-awesome-icon :icon="['far', 'edit']" />
                  </button>
                  <button
                    v-if="controles.length > 1"
                    type="button"
                    class="btn btn-outline-danger border-0"
                    @click="removeMutation(c.id)"
                  >
                    <font-awesome-icon :icon="['far', 'trash-alt']" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <button
          v-if="finServiceButtonState && hasEditPermission"
          type="button"
          class="btn btn-outline-primary"
          @click="finService"
        >
          <font-awesome-icon class="me-1" :icon="['fas', 'door-closed']" />Fin
          de service
        </button>
        <button
          v-else-if="hasEditPermission"
          type="button"
          class="btn btn-outline-primary"
          @click="incorporation"
        >
          <font-awesome-icon
            class="me-1"
            :icon="['fas', 'door-closed']"
          />Incorporation
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import ControlesMedicauxService from '@/services/ControlesMedicauxService.js';

export default {
  computed: {
    ...mapState({
      activeSapeurId: (state) => state.sapeur.active.id,
      medecins: (state) => state.medecin.liste,
      localites: (state) => state.localite.liste,
      types: (state) => state.controlesMedicauxType.liste,
      controles: (state) => state.sapeur.active.controles,
    }),
  },
  watch: {
    activeSapeurId(id) {
      this.$store.dispatch('fetchSapeurControlesMedicaux', id);
    },
  },
  mounted() {
    this.$store.dispatch('fetchSapeurControlesMedicaux', this.activeSapeurId);
    this.$store.dispatch('fetchMedecins', this.activeSapeurId);
    this.$store.dispatch('fetchControlesMedicauxTypes', this.activeSapeurId);
  },
  methods: {
    downloadJustificatif({ id, filename }) {
      ControlesMedicauxService.downloadJustificatif(id, filename);
    },
  },
};
</script>

<style></style>
