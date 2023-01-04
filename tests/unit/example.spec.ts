import { mount } from '@vue/test-utils';
import Tab1Page from '@/views/Tab1Page.vue';

jest.mock('@/composables/useVaultFactory');

describe('Tab1Page.vue', () => {
  it('renders tab 1 Tab1Page', () => {
    const wrapper = mount(Tab1Page);
    expect(wrapper.text()).toMatch('Tab 1');
  });
});
