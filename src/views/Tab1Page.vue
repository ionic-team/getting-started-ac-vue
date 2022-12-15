<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Tab 1</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 1</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-button v-if="authenticated === false" @click="loginClicked">Login</ion-button>
      <ion-button v-if="authenticated" @click="logoutClicked">Logout</ion-button>

      <p v-if="userName">Currently logged in as: {{ userName }}</p>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonButton, IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
import { ref } from 'vue';
import useAuth from '@/composables/auth';

const authenticated = ref<boolean | undefined>();
const userName = ref<string | undefined>();
const { getUserName, isAuthenticated, login, logout } = useAuth();

const checkAuth = async () => {
  authenticated.value = await isAuthenticated();
  userName.value = await getUserName();
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
