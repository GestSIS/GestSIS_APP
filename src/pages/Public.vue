<template>
<div>
	<header>
		<div class="navbar navbar-dark bg-dark">
			<div class="container d-flex justify-content-between">
				<a href="#" class="navbar-brand">www.gestsis.ch</a>
				<a href="&#109;&#097;&#105;&#108;&#116;&#111;:&#105;&#110;&#102;&#111;&#064;&#103;&#101;&#115;&#116;&#115;&#105;&#115;&#046;&#099;&#104;"
					class="text-white">&#105;&#110;&#102;&#111;&#064;&#103;&#101;&#115;&#116;&#115;&#105;&#115;&#046;&#099;&#104;</a>
			</div>
		</div>
	</header>
	<main role="main">
		<section class="jumbotron text-center">
			<div class="container">
				<h1 class="jumbotron-heading">GestSIS</h1>
				<p class="lead text-muted">Le logiciel GestSIS est un programme de gestion spécialement élaboré pour vous aider à gèrer les données de votre SIS.</p>
				<p>
					<button @click="login" class="btn btn-primary mr-1">Accès GestSIS 2.0</button>
					<button href="#C2" class="btn btn-secondary ml-1">En savoir plus</button>
				</p>
			</div>
		</section>

		<div class="album text-muted">
			<div class="container">
				<h2 id="C2">Documentation</h2>
				<div class="row">
					<div class="card col-12">
						<ul>
							<li><a href="files/manuelWebGestSIS.pdf">Manuel WebGestSIS</a></li>
							<li><a href="files/GestSIS-2011.ppsx">Présentation du 07.10.2011</a></li>
						</ul>
					</div>
				</div>
			</div>
    </div>
  </main>

	<footer class="text-muted">
		<div class="container">
			<p class="float-right">
				<a href="#">Back to top</a>
			</p>
			<p>All rights reserved © 2020 GestSIS</p>
		</div>
	</footer>
</div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters([
      'isLoggedIn',
    ])
  },
  methods: {
    login() {
      if (this.isLoggedIn) {
        // Go to home
        this.$router.push({ path: 'accueil' })
      } else {
        // Go to login
        this.$router.push({ path: 'login' })
      }
    }
  },
}
</script>

<style scoped>
.jumbotron {
  padding-top: 6rem;
  padding-bottom: 6rem;
  margin-bottom: 0;
  background-color: #fff;
}

.jumbotron p:last-child {
  margin-bottom: 0;
}

.jumbotron-heading {
  font-weight: 300;
}

.jumbotron .container {
  max-width: 40rem;
}

.album:first-of-type{
  padding-top: 3rem;
}

.album {
  background-color: #f7f7f7;
}

.card {
  padding: .75rem;
  margin-bottom: 2rem;
  border: 0;
}

.card-text {
  font-size: 85%;
}

footer {
  padding-top: 3rem;
  padding-bottom: 3rem;
}

footer p {
  margin-bottom: .25rem;
}

.align-vertical{
  margin: auto;
}

.img-fetch{
  height: auto;
  max-height: 220px;
  width: 100%;
  display: block;
}

.bg-red {
  background-color: red;
}

</style>