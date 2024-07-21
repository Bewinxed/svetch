<script lang="ts">
  import type { RecursiveJSONSchema } from "src\lib\api\api";

  const typeColors: Record<string, string> = {
    string: "text-yellow-500",
    number: "text-blue-500",
    boolean: "text-green-500",
    object: "text-purple-500",
    array: "text-pink-500",
  };
  export let data: RecursiveJSONSchema;
  export let name: string | undefined = undefined;
  export let required: boolean = false;
  export let level: number = 0;
  const indentSize: number = 2; // Adjust this to control the indent size
</script>

{#if data}
  {#if data.type === "object" && data.properties}
    {#each Object.entries(data.properties) as [param, schema] (param)}
      <svelte:self
        data={schema}
        name={param}
        {level}
        required={data.required && data.required.includes(param)}
      />
    {/each}
  {:else if data.type === "array" && data.items}
    <pre class="mb-0 flex h-8 flex-row" data-prefix={level + 1}>
		<code
        >{name}: <span class:required class={typeColors[data.type]}
          >{data.type}</span
        > [</code
      >
		<br />
	
	</pre>

    <div
      class="my-1 ml-12 border-b border-l border-dashed border-gray-300 py-2 pl-0"
    >
      <svelte:self data={data.items} level={level + 1} required={data} />
      <span class="ml-6">]</span>
    </div>
  {:else}
    <pre class="mb-0 flex h-8 flex-row" data-prefix={level + 1}>
			
				
	<code class:required
        >{name}: <span class={typeColors[data.type]}
          >{data.const ? data.const : data.type}</span
        ></code
      >
</pre>
  {/if}
{/if}

<style>
  .required::after {
    content: "*";
    @apply text-secondary;
    margin-left: 0.5rem;
  }
</style>
