<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb bg-white">
            <li class="breadcrumb-item">
              <router-link tag="a" :to="{ name: 'accueil' }"
                >Accueil</router-link
              >
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              Paramètres utilisateur
            </li>
          </ol>
        </nav>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <div class="card card-primary card-outline mb-5">
          <div class="card-header d-flex justify-content-between">
            <h3>Utiliser un jeton</h3>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label for="jeton">Jeton</label>
              <input
                type="text"
                class="form-control"
                id="jeton"
                placeholder="jeton"
                v-model="jeton"
              />
            </div>
            <button class="btn btn-primary" @click="utiliserJeton">
              Utiliser
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- <div class="row">
      <div class="col-md-12">
        <div class="card card-primary card-outline mb-5">
          <div class="card-header d-flex justify-content-between">
            <h3>TODO: Fonctionalitées</h3>
          </div>
          <div class="card-body">
            <h4>Dans le future</h4>
            <ul>
              <li>Supprimer ses accès pour un SIS</li>
              <li>Changer son email</li>
              <li>
                Demander un renvoi de la confirmation de l'email si pas validé
              </li>
              <li>Changement de mot de passe</li>
              <li>Contrôler ses données et signaler des changements</li>
            </ul>
          </div>
        </div>
      </div>
    </div> -->
  </div>
</template>

<script>
export default {
  name: 'utilisateur',
  data() {
    return {
      jeton: '',
    };
  },
  methods: {
    utiliserJeton() {
      if (!this.jeton) {
        this.$awn.warning('Jeton invalide');
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
  },
};
</script>

<style>
.m-td-0 > td {
  padding: 0 !important;
}
</style>
