<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb m-3">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'accueil' }">Accueil</router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              Paramètres utilisateur
            </li>
          </ol>
        </nav>
      </div>
    </div>
    <div class="row">
      <!-- Jeton -->
      <div class="col-12 col-sm-6">
        <div class="card card-primary card-outline mb-2">
          <div class="card-header d-flex justify-content-between">
            <h3>Utiliser un jeton</h3>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label for="jeton">Jeton</label>
              <input
                id="jeton"
                v-model="jeton"
                type="text"
                class="form-control form-control-sm"
                placeholder="jeton"
              />
            </div>
            <button class="btn btn-primary" @click="utiliserJeton">
              Utiliser
            </button>
          </div>
        </div>
        <div class="card card-primary card-outline mb-2">
          <div class="card-header d-flex justify-content-between">
            <h3>Recharger mes permission</h3>
          </div>
          <div class="card-body">
            <button class="btn btn-primary" @click="refreshTokens">
              Charger
            </button>
          </div>
        </div>
      </div>
      <!-- Mot de passe -->
      <div class="col-12 col-sm-6">
        <div class="card card-primary card-outline mb-2">
          <div class="card-header d-flex justify-content-between">
            <h3>Changer mon mot de passe</h3>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label for="old-password">Ancien mot de passe</label>
              <input
                id="old-password"
                v-model="oldPassword"
                type="password"
                placeholder="mot de passe"
                required
                autocomplete="off"
                class="form-control form-control-sm"
              />
            </div>
            <div class="mb-3">
              <label for="new-password">Nouveau mot de passe</label>
              <input
                id="newPassword"
                v-model="newPassword"
                type="password"
                placeholder="mot de passe"
                required
                autocomplete="off"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors.password }"
              />
              <div v-if="errors.password" class="invalid-feedback">
                Taille minimum: 8
              </div>
            </div>

            <div class="mb-3">
              <label for="new-password-repeated"
                >Répéter le nouveau mot de passe</label
              >
              <input
                id="newPasswordRepeated"
                v-model="newPasswordRepeated"
                type="password"
                placeholder="répéter mot de passe"
                required
                autocomplete="off"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': !isPasswordIdentical }"
              />
              <div v-if="!isPasswordIdentical" class="invalid-feedback">
                Mot de passe différent
              </div>
            </div>
            <button class="btn btn-primary" @click="changerMotDePasse">
              Changer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- <div class="row">
    <div class="col-md-12">
      <div class="card card-primary card-outline mb-2">
        <div class="card-header d-flex justify-content-between">
          <h3>TODO: Fonctionalitées</h3>
          <ul>
            <li>
              Demander un renvoi de la confirmation de l'email si pas validé
            </li>
            <li>Changement de mot de passe</li>
          </ul>
        </div>
        <div class="card-body">
          <h4>Dans le future</h4>
          <ul>
            <li>Supprimer ses accès pour un SIS</li>
            <li>Changer son email</li>
            <li>Contrôler ses données et signaler des changements</li>
          </ul>
        </div>
      </div>
    </div>
  </div>-->
</template>

<script>
export default {
  name: 'PageUser',
  data() {
    return {
      jeton: '',
      oldPassword: '',
      newPassword: '',
      newPasswordRepeated: '',
      errors: {},
    };
  },
  computed: {
    isPasswordIdentical() {
      return this.newPassword === this.newPasswordRepeated;
    },
  },
  methods: {
    async refreshTokens() {
      this.$store
        .dispatch('refreshToken')
        .then(() => this.$awn.success('Permissions rechargées'))
        .catch(() =>
          this.$awn.alert('Vous avez été déconnecté, veuillez-vous reconnecter')
        );
    },
    async utiliserJeton() {
      if (!this.jeton) {
        this.$awn.alert('Jeton invalide');
      } else {
        this.$store
          .dispatch('useToken', this.jeton)
          .then((message) => {
            this.$awn.success(message || 'Jeton enregistré avec succès');
            this.token = '';
          })
          .catch((e) =>
            this.$awn.alert(e?.message || 'Jeton déjà utilisé ou invalide.')
          );
      }
    },
    async changerMotDePasse() {
      this.errors.password = this.newPassword.length < 7;
      if (!this.isPasswordIdentical || this.errors.password) {
        return;
      }

      this.$store
        .dispatch('changePassword', {
          password: this.oldPassword,
          newPassword: this.newPassword,
        })
        .then((response) => {
          this.$awn.success(response?.message || 'Mot de passe mis à jour');
          this.oldPassword = '';
          this.newPassword = '';
          this.newPasswordRepeated = '';
        })
        .catch((e) => this.$awn.alert(e?.message || 'Mot de passe incorrect'));
    },
  },
};
</script>

<style>
.m-td-0 > td {
  padding: 0 !important;
}

.m-td-0 > td {
  padding: 0 !important;
}
</style>
