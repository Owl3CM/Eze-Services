const StoryModle = (Component, title) => {
  return {
    story: {
      title: `Examples/${title || Component.displayName}`,
      component: Component,
      parameters: { layout: 'fullscreen' }
    },
    Template: (args) => <Component {...args} />
  }
}
export default StoryModle
