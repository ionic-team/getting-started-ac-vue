<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Tab 1</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding" :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 1</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-button v-if="authenticated === false" @click="loginClicked">Login</ion-button>
      <ion-button v-if="authenticated" @click="logoutClicked">Logout</ion-button>

      <div v-if="authenticated">
        <p>Logged as {{ user }}</p>
        <p>Access Token</p>
        <pre>{{ token }}</pre>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonButton, IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
import useAuth from '@/composables/useAuth';
import { ref } from 'vue';

const authenticated = ref<boolean | undefined>();
const user = ref<string | undefined>();
const token = ref<string | undefined>();
const { login, logout, getAccessToken, getUserName, isAuthenticated } = useAuth();

const checkAuth = async () => {
  authenticated.value = await isAuthenticated();
  token.value = await getAccessToken();
  user.value = await getUserName();
};

const loginClicked = async () => {
  try {
    await login();
    checkAuth();
  } catch (err) {
    console.log('Error logging in:', err);
  }
};

const logoutClicked = async () => {
  await logout();
  checkAuth();
};

checkAuth();
</script>
