<script>
  import { createEventDispatcher } from 'svelte';

  export let exclude = [], hideByExclude = true;

  let child, isShow = false;

  const dispatch = createEventDispatcher();

  function isExcluded(target) {
    var parent = target;

    while (parent) {

      if(isShow && exclude.indexOf(parent) >= 0 && hideByExclude)
        return false;
      if (parent === child || exclude.indexOf(parent) >= 0){
        return true;
      }
        
      parent = parent.parentNode;
    }
    return false;
  }

  function onClickOutside(event) {
    if (!isExcluded(event.target)) {
      isShow = false;
      dispatch('clickoutside');
    } else isShow = true;
  }
</script>

<svelte:window on:click={onClickOutside} on:touch={onClickOutside}/>
<div bind:this={child}>
  <slot></slot>
</div>
