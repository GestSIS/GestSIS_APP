<template>
  <header class="hero is-light">
    <nav class="navbar">
      <div class="navbar-brand">
        <a class="navbar-item" href="http://bulma.io">
          <img
            src="http://bulma.io/images/bulma-logo.png"
            alt="Bulma: a modern CSS framework based on Flexbox"
            width="112"
            height="28"
          />
        </a>

        <a
          class="navbar-item is-hidden-desktop"
          href="https://github.com/jgthms/bulma"
          target="_blank"
        >
          <span class="icon" style="color: #333;">
            <i class="fa fa-github"></i>
          </span>
        </a>

        <a
          class="navbar-item is-hidden-desktop"
          href="https://twitter.com/jgthms"
          target="_blank"
        >
          <span class="icon" style="color: #55acee;">
            <i class="fa fa-twitter"></i>
          </span>
        </a>

        <div class="navbar-burger burger" data-target="navMenubd-example">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div id="navMenubd-example" class="navbar-menu">
        <div class="navbar-start">
          <div class="navbar-item has-dropdown is-hoverable">
            <a
              class="navbar-link is-active"
              href="/documentation/overview/start/"
              >Docs</a
            >
            <div class="navbar-dropdown">
              <a class="navbar-item" href="/documentation/overview/start/"
                >Overview</a
              >
              <a
                class="navbar-item"
                href="http://bulma.io/documentation/modifiers/syntax/"
                >Modifiers</a
              >
              <a
                class="navbar-item"
                href="http://bulma.io/documentation/columns/basics/"
                >Columns</a
              >
              <a
                class="navbar-item"
                href="http://bulma.io/documentation/layout/container/"
                >Layout</a
              >
              <a
                class="navbar-item"
                href="http://bulma.io/documentation/form/general/"
                >Form</a
              >
              <a
                class="navbar-item"
                href="http://bulma.io/documentation/elements/box/"
                >Elements</a
              >

              <a
                class="navbar-item is-active"
                href="http://bulma.io/documentation/components/breadcrumb/"
                >Components</a
              >

              <hr class="navbar-divider" />
              <div class="navbar-item">
                <div>
                  <p class="is-size-6-desktop">
                    <strong class="has-text-info">0.5.1</strong>
                  </p>

                  <small>
                    <a class="bd-view-all-versions" href="/versions"
                      >View all versions</a
                    >
                  </small>
                </div>
              </div>
            </div>
          </div>
          <div class="navbar-item has-dropdown is-hoverable">
            <a class="navbar-link" href="http://bulma.io/blog/">Blog</a>
            <div
              id="blogDropdown"
              class="navbar-dropdown"
              data-style="width: 18rem;"
            >
              <a class="navbar-item" href="/2017/08/03/list-of-tags/">
                <div class="navbar-content">
                  <p>
                    <small class="has-text-info">03 Aug 2017</small>
                  </p>
                  <p>New feature: list of tags</p>
                </div>
              </a>

              <a
                class="navbar-item"
                href="/2017/08/01/bulma-bootstrap-comparison/"
              >
                <div class="navbar-content">
                  <p>
                    <small class="has-text-info">01 Aug 2017</small>
                  </p>
                  <p>Bulma / Bootstrap comparison</p>
                </div>
              </a>

              <a
                class="navbar-item"
                href="/2017/07/24/access-previous-bulma-versions/"
              >
                <div class="navbar-content">
                  <p>
                    <small class="has-text-info">24 Jul 2017</small>
                  </p>
                  <p>Access previous Bulma versions</p>
                </div>
              </a>

              <a class="navbar-item" href="http://bulma.io/blog/">More posts</a>
              <hr class="navbar-divider" />
              <div class="navbar-item">
                <div class="navbar-content">
                  <div class="level is-mobile">
                    <div class="level-left">
                      <div class="level-item">
                        <strong>Stay up to date!</strong>
                      </div>
                    </div>
                    <div class="level-right">
                      <div class="level-item">
                        <a
                          class="button bd-is-rss is-small"
                          href="http://bulma.io/atom.xml"
                        >
                          <span class="icon is-small">
                            <i class="fa fa-rss"></i>
                          </span>
                          <span>Subscribe</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="navbar-item has-dropdown is-hoverable">
            <div class="navbar-link">More</div>
            <div id="moreDropdown" class="navbar-dropdown">
              <a class="navbar-item" href="http://bulma.io/extensions/">
                <div class="level is-mobile">
                  <div class="level-left">
                    <div class="level-item">
                      <p>
                        <strong>Extensions</strong>
                        <br />
                        <small>Side projects to enhance Bulma</small>
                      </p>
                    </div>
                  </div>
                  <div class="level-right">
                    <div class="level-item">
                      <span class="icon has-text-info">
                        <i class="fa fa-plug"></i>
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          </div>
          <a class="navbar-item" href="http://bulma.io/expo/">
            <span class="bd-emoji">🎨</span>
            Expo
          </a>
          <a class="navbar-item" href="http://bulma.io/love/">
            <span class="bd-emoji">❤️</span>
            Love
          </a>
        </div>

        <div class="navbar-end">
          <a
            class="navbar-item is-hidden-desktop-only"
            href="https://github.com/jgthms/bulma"
            target="_blank"
          >
            <span class="icon" style="color: #333;">
              <i class="fa fa-github"></i>
            </span>
          </a>
          <a
            class="navbar-item is-hidden-desktop-only"
            href="https://twitter.com/jgthms"
            target="_blank"
          >
            <span class="icon" style="color: #55acee;">
              <i class="fa fa-twitter"></i>
            </span>
          </a>
          <div class="navbar-item">
            <div class="field is-grouped">
              <p class="control">
                <a
                  class="bd-tw-button button"
                  data-social-network="Twitter"
                  data-social-action="tweet"
                  data-social-target="http://bulma.io"
                  target="_blank"
                  href="https://twitter.com/intent/tweet?text=Bulma: a modern CSS framework based on Flexbox&hashtags=bulmaio&url=http://bulma.io&via=jgthms"
                >
                  <span class="icon">
                    <i class="fa fa-twitter"></i>
                  </span>
                  <span>Tweet</span>
                </a>
              </p>
              <p class="control">
                <a
                  class="button is-primary"
                  href="https://github.com/jgthms/bulma/archive/0.5.1.zip"
                >
                  <span class="icon">
                    <i class="fa fa-download"></i>
                  </span>
                  <span>Download</span>
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<nav
  class="main-header navbar navbar-expand bg-white navbar-light border-bottom"
>
      <!-- Left navbar links -->
      <ul class="navbar-nav">
        <li class="nav-item">
          <a class="nav-link" data-widget="pushmenu" href="#">
            <i class="fa fa-bars"></i>
          </a>
        </li>
        <li class="nav-item d-none d-sm-inline-block">
          <a href="index3.html" class="nav-link">Home</a>
        </li>
        <li class="nav-item d-none d-sm-inline-block">
          <a href="#" class="nav-link">Contact</a>
        </li>
      </ul>

      <!-- SEARCH FORM -->
      <form class="form-inline ml-3">
        <div class="input-group input-group-sm">
          <input
            class="form-control form-control-navbar"
            type="search"
            placeholder="Search"
            aria-label="Search"
          >
          <div class="input-group-append">
            <button class="btn btn-navbar" type="submit">
              <i class="fa fa-search"></i>
            </button>
          </div>
        </div>
      </form>

      <!-- Right navbar links -->
      <ul class="navbar-nav ml-auto">
        <!-- Messages Dropdown Menu -->
        <li class="nav-item dropdown">
          <a class="nav-link" data-toggle="dropdown" href="#">
            <i class="far fa-comments"></i>
            <span class="badge badge-danger navbar-badge">3</span>
          </a>
          <div class="dropdown-menu dropdown-menu-lg dropdown-menu-right">
            <a href="#" class="dropdown-item">
              <!-- Message Start -->
              <div class="media">
                <img
                  src="dist/img/user1-128x128.jpg"
                  alt="User Avatar"
                  class="img-size-50 mr-3 img-circle"
                >
                <div class="media-body">
                  <h3 class="dropdown-item-title">
                    Brad Diesel
                    <span class="float-right text-sm text-danger">
                      <i class="fa fa-star"></i>
                    </span>
                  </h3>
                  <p class="text-sm">Call me whenever you can...</p>
                  <p class="text-sm text-muted">
                    <i class="fa fa-clock-o mr-1"></i> 4 Hours Ago
                  </p>
                </div>
              </div>
              <!-- Message End -->
            </a>
            <div class="dropdown-divider"></div>
            <a href="#" class="dropdown-item">
              <!-- Message Start -->
              <div class="media">
                <img
                  src="dist/img/user8-128x128.jpg"
                  alt="User Avatar"
                  class="img-size-50 img-circle mr-3"
                >
                <div class="media-body">
                  <h3 class="dropdown-item-title">
                    John Pierce
                    <span class="float-right text-sm text-muted">
                      <i class="fa fa-star"></i>
                    </span>
                  </h3>
                  <p class="text-sm">I got your message bro</p>
                  <p class="text-sm text-muted">
                    <i class="fa fa-clock-o mr-1"></i> 4 Hours Ago
                  </p>
                </div>
              </div>
              <!-- Message End -->
            </a>
            <div class="dropdown-divider"></div>
            <a href="#" class="dropdown-item">
              <!-- Message Start -->
              <div class="media">
                <img
                  src="dist/img/user3-128x128.jpg"
                  alt="User Avatar"
                  class="img-size-50 img-circle mr-3"
                >
                <div class="media-body">
                  <h3 class="dropdown-item-title">
                    Nora Silvester
                    <span class="float-right text-sm text-warning">
                      <i class="fa fa-star"></i>
                    </span>
                  </h3>
                  <p class="text-sm">The subject goes here</p>
                  <p class="text-sm text-muted">
                    <i class="fa fa-clock-o mr-1"></i> 4 Hours Ago
                  </p>
                </div>
              </div>
              <!-- Message End -->
            </a>
            <div class="dropdown-divider"></div>
            <a href="#" class="dropdown-item dropdown-footer">See All Messages</a>
          </div>
        </li>
        <!-- Notifications Dropdown Menu -->
        <li class="nav-item dropdown">
          <a class="nav-link" data-toggle="dropdown" href="#">
            <i class="far fa-bell"></i>
            <span class="badge badge-warning navbar-badge">15</span>
          </a>
          <div class="dropdown-menu dropdown-menu-lg dropdown-menu-right">
            <span class="dropdown-header">15 Notifications</span>
            <div class="dropdown-divider"></div>
            <a href="#" class="dropdown-item">
              <i class="fa fa-envelope mr-2"></i> 4 new messages
              <span class="float-right text-muted text-sm">3 mins</span>
            </a>
            <div class="dropdown-divider"></div>
            <a href="#" class="dropdown-item">
              <i class="fa fa-users mr-2"></i> 8 friend requests
              <span class="float-right text-muted text-sm">12 hours</span>
            </a>
            <div class="dropdown-divider"></div>
            <a href="#" class="dropdown-item">
              <i class="fa fa-file mr-2"></i> 3 new reports
              <span class="float-right text-muted text-sm">2 days</span>
            </a>
            <div class="dropdown-divider"></div>
            <a href="#" class="dropdown-item dropdown-footer">See All Notifications</a>
          </div>
        </li>
        <li class="nav-item">
          <a class="nav-link" data-widget="control-sidebar" data-slide="true" href="#">
            <i class="fa fa-th-large"></i>
          </a>
        </li>
      </ul>
    </nav>
