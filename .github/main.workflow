workflow "New workflow" {
  on = "push"
  resolves = ["Test"]
}

action "Test" {
  uses = "elstudio/actions-js-build/build@master"
  args = "test"
  secrets = ["saucekey"]
}
