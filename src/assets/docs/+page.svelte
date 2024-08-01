<script lang="ts">
  import { onMount } from "svelte";
  import { SwaggerUIBundle } from "swagger-ui-dist";
  import "swagger-ui-dist/swagger-ui.css";

  onMount(async () => {
    SwaggerUIBundle({
      url: "/api/schemas/openapi.json",
      dom_id: "#swagger-ui-container",
      defaultModelsExpandDepth: 0,
    });
  });
</script>

<svelte:head>
  <title>SwaggerUI</title>
</svelte:head>

<div id="swagger-ui-container"></div>
