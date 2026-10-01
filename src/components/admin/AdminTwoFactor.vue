<script setup>
import { computed, ref } from "vue";
import { useAdminStore } from "../../stores/admin/Admin";
import useNotification from "../../composables/useNotification.js";

const adminStore = useAdminStore();
const awn = useNotification();

const loading = ref(true);
const enforcedAtInput = ref("");

const loadAll = () =>
  Promise.all([adminStore.loadTwoFactorPolicy(), adminStore.loadTwoFactorStats()]).then(() => {
    enforcedAtInput.value = adminStore.twoFactorPolicy.enforcedAt
      ? adminStore.twoFactorPolicy.enforcedAt.slice(0, 10)
      : "";
    loading.value = false;
  });
loadAll();

const stats = computed(() => adminStore.twoFactorStats);

const saveEnforcedAt = (enforcedAtValue) => {
  const enforcedAt = enforcedAtValue ? new Date(enforcedAtValue).toISOString() : null;
  adminStore
    .updateTwoFactorPolicy(enforcedAt)
    .then(() => awn.success("Politique 2FA mise à jour"))
    .catch((e) => awn.alert(e?.message || "Erreur lors de la mise à jour"));
};

const clearEnforcedAt = () => {
  enforcedAtInput.value = "";
  saveEnforcedAt(null);
};

const revokeExemption = (user) =>
  adminStore
    .revokeTwoFactorExemption(user.id)
    .then(() => adminStore.loadTwoFactorStats())
    .then(() => awn.success("Exemption révoquée"))
    .catch((e) => awn.alert(e?.message || "Erreur lors de la révocation"));

const exemptionFields = [
  { title: "Nom", key: "name" },
  { title: "Email", key: "email" },
  { title: "Raison", key: "two_factor_exempt_reason" },
  { title: "Jusqu'au", key: "two_factor_exempt_until", type: Date },
  { title: "Actions", key: "id", slot: "actions" },
];
</script>

<template>
  <div class="row">
    <div class="col-md-3">
      <div class="card card-primary card-outline mb-2">
        <div class="card-header">
          <h5>Politique d'enforcement</h5>
        </div>
        <div class="card-body">
          <p class="text-body-secondary small">
            À partir de cette date, tout compte sans 2FA activé sera bloqué au login et devra le
            configurer avant de continuer. Les comptes exemptés ne sont jamais bloqués.
          </p>
          <div class="mb-3">
            <label for="enforced-at">Date d'échéance</label>
            <input
              id="enforced-at"
              v-model="enforcedAtInput"
              type="date"
              class="form-control form-control-sm"
            />
          </div>
          <button class="btn btn-primary w-100 mb-2" @click="saveEnforcedAt(enforcedAtInput)">
            Enregistrer
          </button>
          <button
            type="button"
            class="btn btn-outline-secondary w-100"
            :disabled="!adminStore.twoFactorPolicy.enforcedAt"
            @click="clearEnforcedAt"
          >
            Retirer l'échéance
          </button>
        </div>
      </div>
    </div>
    <div class="col-md-9">
      <div class="card card-primary card-outline mb-2">
        <div class="card-header">
          <h5>Adoption</h5>
        </div>
        <div class="card-body">
          <div v-if="loading">Chargement…</div>
          <div v-else class="row text-center">
            <div class="col-4">
              <div class="h2 mb-0">{{ stats.twoFactorEnabled }}</div>
              <div class="text-body-secondary">Activé</div>
            </div>
            <div class="col-4">
              <div class="h2 mb-0">{{ stats.exempt }}</div>
              <div class="text-body-secondary">Exempté</div>
            </div>
            <div class="col-4">
              <div class="h2 mb-0">{{ stats.pending }}</div>
              <div class="text-body-secondary">En attente</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="card card-primary card-outline mb-3 col-12">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Comptes exemptés</h3>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        :fields="exemptionFields"
        :data="stats?.exemptions ?? []"
        :loading="loading"
        :hide-download="true"
        no-data="Aucune exemption"
      >
        <template #actions="{ rowData }">
          <router-link
            class="btn btn-sm btn-outline-primary border-0"
            :to="{ name: 'admin-user', params: { id: rowData.id } }"
          >
            <font-awesome-icon :icon="['far', 'eye']" />
          </router-link>
          <button
            type="button"
            class="btn btn-outline-danger border-0"
            @click="revokeExemption(rowData)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>
