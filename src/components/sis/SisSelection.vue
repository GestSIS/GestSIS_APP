<template>
  <div>
    <hr class="bg-secondary" />
    <div class="info">
      <div class="input-group mb-3">
        <!-- <div class="input-group-prepend">
                    <label class="input-group-text" for="inputGroupSelect01">Options</label>
                </div> -->
        <select
          class="custom-select"
          id="inputGroupSelect01"
          @change="selectSis($event)"
          v-model="sisId"
        >
          <option
            v-for="sis in availableSisListe"
            :key="sis.id"
            :value="sis.id"
          >
            {{ sis.nom }}
          </option>
        </select>
      </div>
      <!-- <a href="#" class="d-block">
             &lt;!&ndash; @if(!empty($user_details['nom']))
             {{ $user_details['prenom'] }} {{ $user_details['nom'] }}
             @else
             {{ $user_details['nom_utilisateur'] }}
             @endif&ndash;&gt;
             John Doe
            </a> -->
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

export default {
  name: 'SisSelection',
  data() {
    return {
      sisId: null,
    };
  },
  mounted() {
    this.sisId = this.activeSisId;
  },
  watch: {
    activeSisId() {
      this.sisId = this.activeSisId;
    },
  },
  computed: {
    ...mapGetters(['availableSisListe']),
    ...mapState({
      activeSisId: (state) => state.auth.sis.activeId,
      listeSis: (state) => state.auth.sis.liste,
    }),
  },
  methods: {
    selectSis(event) {
      const sis = this.listeSis.find((s) => s.id == event.target.value);
      this.$store.dispatch('selectSis', sis).then(() => {
        this.$router.push({ name: 'dashboard' });
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~bootstrap/scss/functions';
@import '~bootstrap/scss/variables';

hr {
  width: 100%;
}
.menu-otpions {
  flex-grow: 1; /*ensures that the container will take up the full height of the parent container*/
  overflow-y: auto; /*adds scroll to this container*/
}

/* Shrinking the sidebar from 250px to 80px and center aligining its content*/
#sidebar.active {
  min-width: 80px;
  max-width: 80px;
  text-align: center;
}

.sidebar {
  padding: 1rem;
  display: flex;
  height: 100%;
  flex-direction: column;
}
.sidebar {
  flex-grow: 1; /*ensures that the container will take up the full height of the parent container*/
  overflow-y: auto; /*adds scroll to this container*/
}
svg {
  margin-right: 0.8rem;
}

.sidebar-header {
  padding: 1rem;
  font-size: 1.6em;
}
/* Toggling the sidebar header content, hide the big heading [h3] and showing the small heading [strong] and vice versa*/
.sidebar-header strong {
  display: none;
}
#sidebar.active .sidebar-header h3 {
  display: none;
}
#sidebar.active .sidebar-header strong {
  display: block;
}

/*#sidebar.active ul li a {
  padding: 20px 10px;
  text-align: center;
  font-size: 0.85em;
}

#sidebar.active ul li a i {
  margin-right: 0;
  display: block;
  font-size: 1.8em;
  margin-bottom: 5px;
}

!* Same dropdown links padding*!
#sidebar.active ul ul a {
  padding: 10px !important;
}*/

/* Changing the arrow position to bottom center position,
       translateX(50%) works with right: 50%
       to accurately  center the arrow */
#sidebar.active .dropdown-toggle::after {
  top: auto;
  bottom: 10px;
  right: 50%;
  -webkit-transform: translateX(50%);
  -ms-transform: translateX(50%);
  transform: translateX(50%);
}

a,
a:hover,
a:focus {
  color: inherit;
  text-decoration: none;
  transition: all 0.3s;
  outline: none;
}

#sidebar {
  /* don't forget to add all the previously mentioned styles here too */
  color: #fff;
  transition: all 0.3s;
}

ul li a:hover {
  color: $primary;
  background: #fff;
}

.router-link-active,
a[aria-expanded='true'] {
  color: #fff;
  background: $primary;
}
</style>
