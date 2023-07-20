<script lang="ts">
	import Icon from '@iconify/svelte'

	export let open = false
	export let title: string | null = null
	export let icon: string | null = null
</script>

<div class="{$$slots.default ? 'collapse-arrow' : ''} collapse  border-gray-300 border shadow-lg bg-gradient-to-br from-base-200 to-white">
	<input type="checkbox" name="my-accordion-2" bind:checked={open} />
	{#if title}
		<div class="collapse-title text-lg font-medium">
			{#if icon}
				<Icon class="inline" inline icon="{icon}" />
			{/if}
			<span>{title}</span>
		</div>
	{:else}
		<div class="collapse-title">
			<slot name="title"><!-- optional fallback --></slot>
		</div>
	{/if}
	<div class="collapse-content shadow-inner">
		<div class="py-2">
		<slot />
	</div>
	</div>
</div>
