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

      <ion-button @click="login">Login</ion-button>
      <ion-button @click="logout">Logout</ion-button>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonButton, IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
import useAuth from '@/use/auth';

export default {
  name: 'Tab1',
  components: { IonButton, IonHeader, IonToolbar, IonTitle, IonContent, IonPage },
  setup() {
    return {
      ...useAuth(),
    };
  },
};
</script>
