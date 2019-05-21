<template>
    <!-- form start -->
    <form role="form">
        <div class="row">
            <div class="col-sm-6">
                <!-- general form elements -->
                <div class="card card-primary card-outline">
                    <div class="card-header">
                        <h3 class="card-title">Données personnelles</h3>
                    </div>
                    <!-- /.card-header -->
                    <div class="card-body">
                        <div class="form-group">
                            <label for="f-sap-civilite">Civilité</label>
                            <select class="form-control" id="f-sap-civilite" name="civilite_id">
<!--                                @foreach($civilites as $civilite)-->
<!--                                <option {{ $sap_details['sapeur']['civilite_id'] == $civilite['id'] ? 'selected' : '' }} value="{{ $civilite['id'] }}">{{ $civilite['designation'] }}</option>-->
<!--                                @endforeach-->
                            </select>
                        </div>
                        <!-- NOM -->
                        <div class="form-group">
                            <label for="f-sap-nom">Nom</label>
                            <input type="text" class="form-control" id="f-sap-nom" name="nom" :value="activeSapeur.nom">
                        </div>
                        <!-- PRENOM -->
                        <div class="form-group">
                            <label for="f-sap-prenom">Prénom</label>
                            <input type="text" class="form-control" id="f-sap-prenom" name="prenom" :value="activeSapeur.prenom">
                        </div>
                        <!-- RUE -->
                        <div class="row">
                            <div class="col-8">
                                <div class="form-group">
                                    <label for="f-sap-rue">Rue</label>
                                    <input type="text" class="form-control" id="f-sap-rue" name="rue" :value="activeSapeur.rue">
                                </div>
                            </div>
                            <div class="col-4">
                                <div class="form-group">
                                    <label for="f-sap-no-rue">N°</label>
                                    <input type="text" class="form-control" id="f-sap-no-rue" name="no_rue" :value="activeSapeur.no_rue">
                                </div>
                            </div>
                        </div>
                        <!-- NPA + LOCALITE -->
                        <div class="form-group">
                            <label for="f-sap-localite">NPA Localité</label>
                            <select class="required" id="f-sap-localite" name="localite_id" style="width: 100%">
                                <!--<option value="{{ $sap_details['sapeur']['localite_id'] }}">{{ $sap_details['sapeur']['npa'].' '.$sap_details['sapeur']['localite'] }}</option>-->
                            </select>
                        </div>
                        <!-- N° AVS -->
                        <div class="form-group">
                            <label for="f-sap-avs">N° AVS</label>
                            <input type="text" class="form-control" id="f-sap-avs" name="no_avs" :value="activeSapeur.no_avs">
                        </div>
                        <!-- DATE NAISSANCE + SUFFIXE -->
                        <div class="row">
                            <div class="col-6">
                                <div class="form-group">
                                    <label for="f-sap-date-naissance">Date de naissance</label>
                                    <div class="input-group">
                                        <div class="input-group-prepend">
                                            <span class="input-group-text"><i class="fa fa-calendar"></i></span>
                                        </div>
                                        <input class="form-control" type="date" id="f-sap-date-naissance" name="date_naissance" :value="activeSapeur.date_naissance">
                                    </div>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="form-group">
                                    <label for="f-sap-suffixe">Suffixe</label>
                                    <input type="text" class="form-control" id="f-sap-suffixe" name="suffixe" :value="activeSapeur.suffixe">
                                </div>
                            </div>
                        </div>
                        <p>Permet de différencier deux personnes ayant le même nom et prénom.</p>
                        <!-- REMARQUE -->
                        <div class="form-group">
                            <label for="f-sap-remarques">Remarques</label>
                            <textarea class="form-control" rows="3" id="f-sap-remarques" name="remarques">{{ activeSapeur.remarques}}</textarea>
                        </div>
                    </div>
                    <!-- /.card-body -->
                </div>
                <!-- /.card -->

                <!-- Form Element sizes -->
                <div class="card card-primary card-outline">
                    <div class="card-header">
                        <h3 class="card-title">Contact</h3>
                    </div>
                    <div class="card-body">
                        <div class="form-group">
                            <label for="f-sap-email">Email</label>
                            <div class="input-group mb-3">
                                <div class="input-group-prepend">
                                    <span class="input-group-text"><i class="fa fa-envelope"></i></span>
                                </div>
                                <input class="form-control" type="email" id="f-sap-email" name="email" :value="activeSapeur.email">
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-3">
                                <div class="form-group">
                                    <label for="f-sap-tel-prive">Tel priv</label>
                                </div>
                                <div class="form-group">
                                    <label for="f-sap-tel-mobile">Smartphone</label>
                                </div>
                                <div class="form-group">
                                    <label for="f-sap-tel-prof">Tel Prof</label>
                                </div>
                            </div>
                            <div class="col-4">
                                <div class="form-group">
                                    <!--<input type="text" class="form-control" id="f-sap-tel-prive" name="tel_prive" value="{{ $sap_details['sapeur']['tel_prive'] }}">-->
                                </div>
                                <div class="form-group">
                                    <!--<input type="text" class="form-control" id="f-sap-tel-mobile" name="tel_mobile" value="{{ $sap_details['sapeur']['tel_mobile'] }}">-->
                                </div>
                                <div class="form-group">
                                    <!--<input type="text" class="form-control" id="f-sap-tel-prof" name="tel_prof" value="{{ $sap_details['sapeur']['tel_prof'] }}">-->
                                </div>
                            </div>
                            <!-- TODO N° Transmis pour alarm au CET -->
                        </div>
                    </div>
                    <!-- /.card-body -->
                </div>
                <!-- /.card -->
            </div>
            <!-- /.col -->

            <div class="col-sm-6">
                <!-- general form elements -->
                <div class="card card-primary card-outline">
                    <div class="card-header">
                        <h3 class="card-title">Références professionnelles</h3>
                    </div>
                    <!-- /.card-header -->
                    <!-- form start -->
                    <form role="form">
                        <div class="card-body">
                            <div class="form-group">
                                <label for="f-sap-profession">Profession</label>
                                <input type="text" class="form-control" id="f-sap-profession" name="profession" :value="activeSapeur.profession">
                            </div>
                            <div class="form-group">
                                <label for="f-sap-employeur">Employeur</label>
                                <input type="text" class="form-control" id="f-sap-employeur" name="employeur" :value="activeSapeur.employeur">
                            </div>
                            <div class="form-group">
                                <label for="f-sap-lieu-travail">Lieu de travail</label>
                                <input type="text" class="form-control" id="f-sap-lieu-travail" name="lieu_travail" :value="activeSapeur.lieu_travail">
                            </div>
                            <!-- TODO Add image -->
                        </div>
                    </form>
                </div>
                <!-- /.card -->

                <div class="card card-primary card-outline">
                    <div class="card-header">
                        <h3 class="card-title">Incorporation / Sortie</h3>
                        <button class="btn btn-primary">Modifier</button> <!-- TODO  -->
                    </div>
                    <!-- /.card-header -->
                    <!-- form start -->
                    <form role="form">
                        <div class="card-body">
                            <table data-toggle="table"
                                   data-url="http://bootstrap-table.wenzhixin.net.cn/examples/gh/get/response.json/wenzhixin/bootstrap-table/tree/master/docs/data/data1/"
                                   data-search="true"
                                   data-show-refresh="true"
                                   data-show-toggle="true"
                                   data-show-columns="true">
                                <thead>
                                <tr>
                                    <th data-field="date">Date</th>
                                    <th data-field="Abr">Abr</th>
                                    <th data-field="designation">Désignation</th>
                                    <th data-field="remarques">Remarques</th>
                                </tr>
                                </thead>
                            </table>
                        </div>
                    </form>
                </div>
                <!-- /.card -->

                <div class="card card-primary card-outline">
                    <div class="card-header">
                        <h3 class="card-title">Informations</h3>
                    </div>
                    <!-- /.card-header -->
                    <!-- form start -->
                    <form role="form">
                        <div class="card-body">
                            <div class="form-group">
                                <label for="fonctionInput">Fonction principale</label>
                                <input class="form-control" id="fonctionInput" type="text">
                            </div>
                            <div class="form-group">
                                <label for="gradeInput">Grade actuel</label>
                                <input class="form-control" id="gradeInput" type="text">
                            </div>
                            <!-- TODO Actif et Porteur checkbox -->
                        </div>
                    </form>
                </div>
                <!-- /.card -->

                <div class="card card-primary">
                    <div class="card-footer text-right">
                        <button type="submit" class="btn btn-primary">Enregistrer</button>
                    </div>
                </div>
            </div>
            <!-- /.col -->
        </div>
    </form>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: "SapeurTabGeneral",
  computed: {
    ...mapGetters(['activeSapeur'])
  }
}
</script>

<style scoped>

</style>