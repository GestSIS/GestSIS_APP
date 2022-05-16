<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">Convoquer par SMS</h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="row">
        <div class="col-8">
          <base-table :fields="fields" :data="computedSapeurs">
            <template v-slot:checkbox="{ key, value, rowData }">
              <input type="checkbox" class="form-check-input" :id="key + '-' + rowData.id" :checked="value" disabled />
            </template>
          </base-table>
        </div>
        <div class="col-4">
          <base-checkbox class="mb-3" label="Envoie différé" v-model="params.differe" />
          <div class="mb-3">
            <label for="date">Date</label>
            <input type="datetime-local" v-model="params.date" class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['date'] }" id="date" />
          </div>
          <!-- <div class="mb-3">
            <label for="origine">Origine</label>
            <input type="text" v-model="params.origine" class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['origine'] }" id="origine" />
          </div> -->
          <div class="mb-3">
            <label for="commentaire">Message ({{ 500 - params.message.length }})</label>
            <textarea maxlength="500" v-model="params.message" class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['commentaire'] }" id="commentaire" rows="6"></textarea>
          </div>
          <p>Crédit : <span>{{ loadingCredit ? 'chargement...' : credit }}</span></p>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">Fermer</button>
      <button type="button" class="btn btn-primary" @click="save()">Envoyer</button>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import { DateTime } from 'luxon';

import BaseTable from '@/components/table/BaseTable.vue';
import SapeurService from '../../services/SapeurService';
import ExerciceService from '../../services/ExerciceService';

export default {
  name: 'ModalSms',
  components: { BaseTable },
  props: {
    data: {
      type: Object,
    },
  },
  data() {
    return {
      errors: {},
      loadingSapeurs: true,
      loadingCredit: true,
      sapeurs: [],
      presences: [],
      params: {
        origin: "GestSIS",
        differe: true,
        date: "",
        selectedSapeurs: [],
        message: "",
      },
      fields: [
        {
          title: 'Nom prénom',
          key: 'nomPrenom',
          sortKey: 'nomPrenom',
          titleClass: 'align-middle',
        },
        {
          title: 'Convoqué',
          key: 'convoque',
          titleClass: 'align-middle text-center',
          columnClass: 'align-middle text-center',
          sortKey: 'convoque',
          slot: "checkbox",
        },
        {
          title: 'Excusé',
          key: 'excuse',
          titleClass: 'align-middle text-center',
          columnClass: 'align-middle text-center',
          sortKey: 'excuse',
          slot: "checkbox",
        },
        {
          title: 'Portable',
          key: 'portable',
          sortKey: 'portable',
          titleClass: 'align-middle',
        },
        // {
        //   title: 'Actions',
        //   key: 'actions',
        //   slot: 'actions',
        //   titleClass: 'align-middle text-center',
        //   columnClass: 'align-middle text-center'
        // },
      ],
    };
  },
  beforeMount() {
    let resolvedCount = 0;
    SapeurService.getSapeurPourConvocationSms()
      .then((sapeurs) => {
        this.sapeurs = sapeurs;
        resolvedCount++;
        this.loadingSapeurs = resolvedCount == 2;
      });
    ExerciceService.getSapeurs(this.data.id)
      .then((presences) => {
        this.presences = presences;
        resolvedCount++;
        this.loadingSapeurs = resolvedCount == 2;
      });
  },
  mounted() {
    this.loadingCredit = true;
    this.$store.dispatch('fetchAspsmsCredit').then(() => this.loadingCredit = false).catch(() => {
      this.loadingCredit = false;
      console.log("ASPSMS non configuré");
    })

    const localite = this.localites.find(l => l.id == this.data.localite_id);
    const categorie = this.categories.find(l => l.id == this.data.exercice_categorie_id);
    this.params.date = this.data.date + " " + this.data.heure;

    this.params.message = `Rappel\n` +
      `${DateTime.fromSQL(this.data.date).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)} ${this.data.heure.slice(0, 5)} ${this.data.lieu} à ${localite?.designation ?? ""} \n` +
      `${categorie?.designation} : ${this.data.communications}`
  },
  computed: {
    ...mapState({
      credit: (state) => state.aspsmsParam.credit,
      localites: (state) => state.localite.liste,
      categories: (state) => state.exerciceCategorie.liste,
    }),
    computedSapeurs() {
      if (!this.loadingSapeurs) {
        return [];
      }
      const indexedSapeurs = {};
      this.sapeurs.forEach(s => indexedSapeurs[s.id] = {
        nomPrenom: `${s.nom} ${s.prenom}`,
        portable: s.telephones
          .filter(a => a.telephone_type_id === 2)
          .sort((a, b) => a.priorite - b.priorite)
          .find(() => true)?.numero,
      });
      return this.presences.map(s => ({ ...s, ...(indexedSapeurs[s.sapeur_id] ?? {}) }));
    }
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    async save() {
      // //Format back dates to SQL Format
      // this.activeAppel.date = DateTime.fromISO(this.activeAppel.date2).toFormat(
      //   this.format
      // );

      // this.$store
      //   .dispatch('addInterventionAppel', this.activeAppel)
      //   .then(() => {
      //     this.errors = {};
      //     this.HIDE_MODAL();
      //   })
      //   .catch(
      //     (errors) =>
      //     (this.errors = {
      //       ...errors,
      //       date: errors['appels.0.date'],
      //       nom: errors['appels.0.nom'],
      //       numero: errors['appels.0.numero'],
      //       commentaire: errors['appels.0.commentaire'],
      //     })
      //   );
    },
  },
};
</script>

<style scoped>
</style>
