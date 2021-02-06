<template>
  <aside id="sidebar" class="bg-dark">
    <div class="sidebar-header bg-dark">
      <span class="brand-text font-weight-light">GestSIS</span>
    </div>

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
        <li class="nav-item">
          <router-link :to="{ name: 'sapeurs' }" class="nav-link internal-link">
            <font-awesome-icon icon="user" />
            <span>Sapeurs</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link
            :to="{ name: 'interventions' }"
            class="nav-link internal-link"
          >
            <font-awesome-icon icon="fire-extinguisher" />
            <span>Interventions</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link
            :to="{ name: 'exercices' }"
            class="nav-link internal-link"
          >
            <font-awesome-icon :icon="['fas', 'calendar-alt']" />
            <span>Exercices &amp; Séances</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/organisation" class="nav-link internal-link">
            <font-awesome-icon icon="sitemap" />
            <span>Organisation</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link
            :to="{ name: 'comptabilite-compte' }"
            class="nav-link internal-link"
          >
            <font-awesome-icon icon="calculator" />
            <span>Comptabilité</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/publipostage" class="nav-link internal-link">
            <font-awesome-icon icon="envelope" />
            <span>Publipostage</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/statistique" class="nav-link internal-link">
            <font-awesome-icon :icon="['far', 'chart-bar']" />
            <span>Statistiques</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/matériel" class="nav-link internal-link">
            <font-awesome-icon icon="toolbox" />
            <span>Matériel personel</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link
            :to="{ name: 'controles-medicaux' }"
            class="nav-link internal-link"
          >
            <font-awesome-icon icon="file-medical-alt" />
            <span>Contrôles médicaux</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/impressions" class="nav-link internal-link">
            <font-awesome-icon icon="sitemap" />
            <span>Impressions</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link
            :to="{ name: 'param-general' }"
            class="nav-link internal-link"
          >
            <font-awesome-icon icon="sliders-h" />
            <span>Configuration</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/rta" class="nav-link internal-link">
            <font-awesome-icon icon="globe-europe" />
            <span>Exportation -> RTA</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link :to="{ name: 'about' }" class="nav-link internal-link">
            <font-awesome-icon icon="info-circle" />
            <span>A propos</span>
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
  <!-- /.sidebar -->
</template>

<script>
export default {
  name: 'MainSidebar',
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
