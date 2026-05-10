<script setup>
import { computed, ref } from 'vue';
import useNotification from '../../composables/useNotification';
import { useModalStore } from '../../stores/common/Modal';
import { useAdminStore } from '../../stores/admin/Admin';
import { useAuthStore } from '../../stores/auth/Auth';

const adminStore = useAdminStore();
const authStore = useAuthStore();

const loading = ref(true);
const loadSis = authStore.loadSisListe();
const loadSisAdmin = adminStore.loadAllSis();
const loadParams = adminStore.loadAllSisParams();
const loadContacts = adminStore.loadAllSisContacts();

Promise.all([loadSis, loadSisAdmin, loadContacts, loadParams])
  .then(() => (loading.value = false))
  .catch(() => (loading.value = false));

const sis = computed(() => adminStore.sis);
const contacts = computed(() => adminStore.contacts);
const params = computed(() => adminStore.params);
const computedSis = computed(() =>
  sis.value?.map((s) => {
    const computedContacts = contacts.value[s.api_key] ?? [];
    return {
      ...s,
      news: computedContacts.filter((c) => c.liste === 'news'),
      facturation: computedContacts.filter((c) => c.liste === 'facturation'),
    };
  }),
);

const { showModal } = useModalStore();
const awn = useNotification();
const jsonExport = () => {
  const data = JSON.stringify(
    sis.value.map((sis) => ({
      ...sis,
      contacts: contacts.value[sis.api_key],
      params: params.value[sis.api_key],
    })),
  );

  navigator.clipboard.writeText(data);

  awn.success('Données copiées dans le press papier');
};
const editSis = (sis) => showModal({ component: 'ModalSis', data: sis });
const ajoutSis = () => showModal({ component: 'ModalSis' });

const fields = [
  { title: 'id', key: 'id' },
  { title: 'api_key', key: 'api_key' },
  { title: 'Nom', key: 'nom' },
  { title: 'Abréviation', key: 'abreviation' },
  { title: 'Mobile', key: 'mobile', type: Boolean },
  { title: 'Newsletter', key: 'news', slot: 'badges' },
  { title: 'Facturation', key: 'facturation', slot: 'badges' },
  { title: 'Actions', key: 'id', slot: 'actions' },
];
</script>

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
                  ([key, _]) => sis.find((s) => s.api_key === key)?.mobile,
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
        :loading="loading"
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
