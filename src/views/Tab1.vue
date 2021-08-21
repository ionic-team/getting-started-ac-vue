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
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { ref } from 'vue';
import { IonButton, IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
import useAuth from '@/use/auth';

export default {
  name: 'Tab1',
  components: { IonButton, IonHeader, IonToolbar, IonTitle, IonContent, IonPage },
  setup() {
    const authenticated = ref<boolean | undefined>();
    const { login, logout, isAuthenticated } = useAuth();

    const checkAuth = async () => {
      authenticated.value = await isAuthenticated();
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

    return {
      authenticated,
      loginClicked,
      logoutClicked,
    };
  },
};
</script>
