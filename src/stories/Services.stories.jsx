import React from 'react';
import Services from './Services';

export default {
  title: 'Examples/Service',
  component: Services,
  parameters: {layout: 'fullscreen'},

};

const Template = (args) => <Services {...args} />;

export const Sample = Template.bind({});

