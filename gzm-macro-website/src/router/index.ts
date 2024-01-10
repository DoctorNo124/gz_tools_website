// Composables
import { createRouter, createWebHistory } from 'vue-router'
import Cat from '@/views/Cat.vue';
import Stats from '@/views/Stats.vue';
import Dashboard from '@/views/Dashboard.vue';
import EditInputs from '@/views/EditInputs.vue';
import Trim from '@/views/Trim.vue';
import Slice from '@/views/Slice.vue';
import Test from '@/views/Test.vue';


const routes = [
  {
    path: '/',
    component: Dashboard, 
    name: 'Dashboard',
  },
  {
    path: '/cat',
    component: Cat, 
    name: 'Concatenate',
  },
  {
    path: '/stats', 
    component: Stats, 
    name: 'Statistics',
  }, 
  {
    path: '/inputs', 
    component: EditInputs,
    name: 'Inputs',
  }, 
  {
    path: '/trim', 
    component: Trim, 
    name: 'Trim',
  }, 
  {
    path: '/slice', 
    component: Slice, 
    name: 'Slice',
  }, 
  {
    path: '/test', 
    component: Test, 
    name: 'Test',
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
