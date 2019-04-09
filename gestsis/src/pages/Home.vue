<template>
  <div class="columns">
    <aside class="column is-2">
      <nav class="menu">
        <p class="menu-label">General</p>
        <ul class="menu-list">
          <li>
            <router-link to="/sapeurs" class="is-active">Sapeurs</router-link>
          </li>
          <li>
            <a>Exercices</a>
          </li>
          <li>
            <a>Interventions</a>
          </li>
          <li>
            <a>Frais</a>
          </li>
          <li>
            <a>Matériel</a>
          </li>
          <li>
            <a>Certifiats médicaux</a>
          </li>
        </ul>
        <p class="menu-label">Export</p>
        <ul class="menu-list">
          <li>
            <a>RTA</a>
          </li>
        </ul>
        <p class="menu-label">Settings</p>
        <ul class="menu-list">
          <li>
            <a>Logs</a>  
          </li>
          <li>
            <a class>Divers</a>
            <ul>
              <li>
                <a>Impressions</a>
              </li>
              <li>
                <a>Rapports</a>
              </li>
              <li>
                <a>Rights</a>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </aside>

    <main class="column">
      <div class="level">
        <div class="level-left">
          <div class="level-item">
            <div class="title">Dashboard</div>
          </div>
        </div>
        <div class="level-right">
          <div class="level-item">
            <button type="button" class="button is-small">
              March 8, 2017 - April 6, 2017
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
