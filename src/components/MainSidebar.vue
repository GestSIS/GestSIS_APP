<template>
  <aside id="sidebar" class="bg-dark">
    <div class="sidebar-header bg-dark">
      <span class="brand-text font-weight-light">GestSIS</span>
    </div>
    <sis-selection />
    <!--    <hr class="bg-secondary" />-->
    <!--    &lt;!&ndash; Sidebar user panel (optional) &ndash;&gt;-->
    <!--    <div class="sidebar-user">-->
    <!--      <div class="image">-->
    <!--        &lt;!&ndash; @if($user_details['photo'])-->
    <!--        <img-->
    <!--          src="{{ $user_details['photo'] }}"-->
    <!--          class="img-circle elevation-2"-->
    <!--        >-->
    <!--        @endif&ndash;&gt;-->
    <!--        Image-->
    <!--      </div>-->
    <!--      <div class="info">-->
    <!--        <a href="#" class="d-block">-->
    <!--          &lt;!&ndash; @if(!empty($user_details['nom']))-->
    <!--          {{ $user_details['prenom'] }} {{ $user_details['nom'] }}-->
    <!--          @else-->
    <!--          {{ $user_details['nom_utilisateur'] }}-->
    <!--          @endif&ndash;&gt;-->
    <!--          John Doe-->
    <!--        </a>-->
    <!--      </div>-->
    <!--    </div>-->
    <hr class="bg-light" />

    <!-- Sidebar Menu -->
    <nav class="menu-options mt-2">
      <ul
        class="nav nav-pills nav-sidebar flex-column"
        data-widget="treeview"
        role="menu"
        data-accordion="false"
      >
        <li class="nav-item" v-for="link in filteredLinks" :key="link.nom">
          <router-link :to="link.to" class="nav-link internal-link">
            <font-awesome-icon :icon="link.icon" />
            <span>{{ link.nom }}</span>
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
  <!-- /.sidebar -->
</template>

<script>
import SisSelection from '@/components/sis/SisSelection.vue';
import permissions from '@/store/permissions.js';

import { mapState } from 'vuex';

export default {
  name: 'MainSidebar',
  components: {
    SisSelection,
  },
  data() {
    return {
      links: [
        {
          to: { name: 'sapeurs' },
          icon: 'user',
          nom: 'Sapeurs',
          permission: permissions.SAPEUR.LECTURE,
        },
        {
          to: { name: 'interventions' },
          icon: 'fire-extinguisher',
          nom: 'Interventions',
          permission: permissions.INTERVENTION.LECTURE,
        },
        {
          to: { name: 'exercices' },
          icon: ['fas', 'calendar-alt'],
          nom: 'Exercices & Séances',
          permission: permissions.EXERCICE.PRESENCE,
        },
        {
          to: '/organisation',
          icon: 'sitemap',
          nom: 'Organisation',
          permission: permissions.ORGANISATION.MODIFICATION,
        },
        {
          to: { name: 'comptabilite-decompte' },
          icon: 'calculator',
          nom: 'Comptabilité',
          permission: permissions.COMPTABILITE.TOUT,
        },
        {
          to: '/publipostage',
          icon: 'envelope',
          nom: 'Publipostage',
        },
        {
          to: '/statistique',
          icon: ['far', 'chart-bar'],
          nom: 'Statistiques',
        },
        {
          to: '/matériel',
          icon: 'toolbox',
          nom: 'Matériel personel',
        },
        {
          to: { name: 'controles-medicaux' },
          icon: 'file-medical-alt',
          nom: 'Contrôles médicaux',
          permission: permissions.CONTROLE_MEDICAL.TOUT,
        },
        {
          to: '/impressions',
          icon: 'sitemap',
          nom: 'Impressions',
        },
        {
          to: { name: 'users' },
          icon: 'user',
          nom: 'Utilisateurs',
          permission: permissions.ADMIN.TOUT,
        },
        {
          to: { name: 'param-general' },
          icon: 'sliders-h',
          nom: 'Configuration',
          //TODO: See what to do here
          permission: permissions.SIS.CONFIG,
        },
        {
          to: '/rta',
          icon: 'globe-europe',
          nom: 'Exportation RTA',
          permission: permissions.ORGANISATION.TOUT,
        },
        {
          to: { name: 'about' },
          icon: 'info-circle',
          nom: 'A propos',
        },
      ],
    };
  },
  computed: {
    ...mapState({
      perms: (state) => state.auth.sis.permissions,
    }),
    filteredLinks() {
      return this.links.filter(
        (l) => !l.permission || this.perms.includes(l.permission)
      );
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
