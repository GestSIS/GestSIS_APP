<template>
  <div class="row">
    <div class="col-md-3">
      <div class="card card-primary card-outline mb-2">
        <div class="card-header d-flex justify-content-between">
          <h5>Actions</h5>
        </div>
        <div class="card-body d-grid gap-1">
          <a
            class="btn btn-outline-primary"
            :href="
              'mailto:?subject=GestSIS 2.0 - &bcc=' +
              Object.values(contacts)
                .flat()
                .filter((c) => c.liste === 'news')
                .map((c) => c.email)
                .join(';')
            "
            >Email newsletter
          </a>
          <a
            class="btn btn-outline-primary"
            :href="
              'mailto:?bcc=' +
              Object.values(contacts)
                .flat()
                .filter((c) => c.liste === 'facturation')
                .map((c) => c.email)
                .join(';')
            "
            >Email facturation</a
          >
          <a
            class="btn btn-outline-primary"
            :href="
              'mailto:?bcc=' +
              Object.entries(contacts)
                .filter(
                  ([key, _]) => sis.find((s) => s.api_key === key)?.mobile
                )
                .map(([_, value]) => value)
                .flat()
                .filter((c) => c.liste === 'news')
                .map((c) => c.email)
                .join(';')
            "
            >Email mobile</a
          >
          {{}}
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card card-primary card-outline mb-2">
        <div class="card-header d-flex justify-content-between">
          <h5>Données</h5>
        </div>
        <div class="card-body d-grid gap-1">
          <button class="btn btn-outline-primary" @click="jsonExport">
            Données JSON
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="card card-primary card-outline mb-3 col-12 col-lg-12">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Sis</h3>
      <button class="btn btn-outline-primary" @click="ajoutSis">Ajouter</button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        ref="table"
        :fields="fields"
        :data="computedSis"
        :selectable="true"
        :hide-download="true"
        no-data="Aucun SIS"
      >
        <template #badges="{ rowData, key }">
          <span
            v-for="e in rowData[key]"
            :key="e.id"
            class="badge bg-primary me-1"
            >{{ e.email }}</span
          >
        </template>
        <template #actions="{ rowData }">
          <button
            type="button"
            class="btn btn-outline-primary border-0"
            @click="editSis(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
        </template>
        <template #foot>
          <tr>
            <th :colspan="fields.length">Nb : {{ sis.length }}</th>
          </tr>
        </template>
      </base-table>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import store from '/src/store/index';

async function loadData(routeTo, next) {
  const loadSis = store.dispatch('loadSisListe');
  const loadParams = store.dispatch('loadAllSisParams');
  const loadContacts = store.dispatch('loadAllSisContacts');

  Promise.all([loadSis, loadContacts, loadParams]).then(() => {
    next();
  });
}

export default {
  name: 'AdminSis',
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      fields: [
        { title: 'id', key: 'id' },
        { title: 'api_key', key: 'api_key' },
        { title: 'Nom', key: 'nom' },
        { title: 'Abréviation', key: 'abreviation' },
        { title: 'Mobile', key: 'mobile', type: Boolean },
        { title: 'Newsletter', key: 'news', slot: 'badges' },
        { title: 'Facturation', key: 'facturation', slot: 'badges' },
        { title: 'Actions', key: 'id', slot: 'actions' },
      ],
    };
  },
  computed: {
    ...mapState({
      sis: (state) => state.admin.sis,
      contacts: (state) => state.admin.contacts,
      params: (state) => state.admin.params,
    }),
    computedSis() {
      return this.sis?.map((s) => {
        const contacts = this.contacts[s.api_key] ?? [];
        return {
          ...s,
          news: contacts.filter((c) => c.liste === 'news'),
          facturation: contacts.filter((c) => c.liste === 'facturation'),
        };
      });
    },
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    jsonExport() {
      const data = JSON.stringify(
        this.sis.map((sis) => ({
          ...sis,
          contacts: this.contacts[sis.api_key],
          params: this.params[sis.api_key],
        }))
      );

      navigator.clipboard.writeText(data);

      this.$awn.success('Données copiées dans le press papier');
    },
    editSis(sis) {
      this.SHOW_MODAL({ component: 'ModalSis', data: sis })
        .then((res) => this.$awn.success(res?.message || 'Sis modifié'))
        .catch((e) =>
          this.$awn.alert(e?.message || 'Erreur lors de la modification')
        );
    },
    ajoutSis() {
      this.SHOW_MODAL({ component: 'ModalSis' })
        .then((res) => this.$awn.success(res?.message || 'Sis ajouté'))
        .catch((e) => this.$awn.alert(e?.message || "Erreur lors de l'ajout"));
    },
  },
};
</script>

<style scoped></style>
