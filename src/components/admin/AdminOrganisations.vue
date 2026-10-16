<script setup>
import { computed, ref } from "vue";
import useNotification from "../../composables/useNotification";
import { useModalStore } from "../../stores/common/Modal";
import { useAdminStore } from "../../stores/admin/Admin";

const adminStore = useAdminStore();

const loading = ref(true);

const loadOrganisations = adminStore.loadAllOrganisations();
const loadParams = adminStore.loadAllSisParams();
const loadContacts = adminStore.loadAllSisContacts();

Promise.all([loadOrganisations, loadContacts, loadParams])
  .then(() => (loading.value = false))
  .catch(() => (loading.value = false));

const organisations = computed(() => adminStore.organisations);
const contacts = computed(() => adminStore.contacts);
const params = computed(() => adminStore.params);
const computedOrganisations = computed(() =>
  organisations.value?.map((s) => {
    const computedContacts = contacts.value[s.org_key] ?? [];
    return {
      ...s,
      news: computedContacts.filter((c) => c.liste === "news"),
      facturation: computedContacts.filter((c) => c.liste === "facturation"),
    };
  }),
);

const { showModal } = useModalStore();
const awn = useNotification();
const jsonExport = () => {
  const data = JSON.stringify(
    organisations.value.map((organisation) => ({
      ...organisation,
      contacts: contacts.value[organisation.org_key],
      params: params.value[organisation.org_key],
    })),
  );

  navigator.clipboard.writeText(data);

  awn.success("Données copiées dans le press papier");
};
const editOrganisation = (organisation) =>
  showModal({ component: "ModalOrganisation", data: organisation });
const ajoutOrganisation = () => showModal({ component: "ModalOrganisation" });

const fields = [
  { title: "id", key: "id" },
  { title: "org_key", key: "org_key" },
  { title: "Nom", key: "nom" },
  { title: "Abréviation", key: "abreviation" },
  { title: "Mobile", key: "mobile", type: Boolean },
  { title: "Newsletter", key: "news", slot: "badges" },
  { title: "Facturation", key: "facturation", slot: "badges" },
  { title: "Actions", key: "id", slot: "actions" },
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
                .filter(([key, _]) => organisations.find((s) => s.org_key === key)?.mobile)
                .map(([_, value]) => value)
                .flat()
                .filter((c) => c.liste === 'news')
                .map((c) => c.email)
                .join(';')
            "
            >Email mobile</a
          >
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card card-primary card-outline mb-2">
        <div class="card-header d-flex justify-content-between">
          <h5>Données</h5>
        </div>
        <div class="card-body d-grid gap-1">
          <button class="btn btn-outline-primary" @click="jsonExport">Données JSON</button>
        </div>
      </div>
    </div>
  </div>
  <div class="card card-primary card-outline mb-3 col-12 col-lg-12">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Organisations</h3>
      <button class="btn btn-outline-primary" @click="ajoutSis">Ajouter</button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        ref="table"
        :fields="fields"
        :data="computedOrganisations"
        :loading="loading"
        :selectable="true"
        :hide-download="true"
        no-data="Aucune organisation"
      >
        <template #badges="{ rowData, key }">
          <span v-for="e in rowData[key]" :key="e.id" class="badge bg-primary me-1">{{
            e.email
          }}</span>
        </template>
        <template #actions="{ rowData }">
          <router-link
            class="btn btn-sm btn-outline-primary border-0"
            :to="{ name: 'admin-organisation-detail', params: { id: rowData.id } }"
          >
            <font-awesome-icon :icon="['far', 'eye']" />
          </router-link>
          <button type="button" class="btn btn-outline-primary border-0" @click="editSis(rowData)">
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
        </template>
        <template #foot>
          <tr>
            <th :colspan="fields.length">Nb : {{ organisations.length }}</th>
          </tr>
        </template>
      </base-table>
    </div>
  </div>
</template>
