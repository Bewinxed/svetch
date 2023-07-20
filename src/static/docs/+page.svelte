<script lang="ts">
  import Icon from "@iconify/svelte";
  import { Svetch } from "[CLIENT_PATH]";
  import { onMount } from "svelte";
  import { quintInOut } from "svelte/easing";
  import { fly, slide } from "svelte/transition";
  import BodyBlock from "./components/BodyBlock.svelte";
  import Collapsible from "./components/Collapsible.svelte";

  let schema: Record<string, any>;

  let table_of_contents: HTMLDialogElement;
  // load schema from /api.json

  // colors for each HTTP method
  const colors: Record<string, string> = {
    GET: "bg-green-500",
    POST: "bg-blue-500",
    PUT: "bg-yellow-500",
    DELETE: "bg-red-500",
    PATCH: "bg-purple-500",
  };

  const text_colors: Record<string, string> = {
    GET: "text-green-500",
    POST: "text-blue-500",
    PUT: "text-yellow-500",
    DELETE: "text-red-500",
    PATCH: "text-purple-500",
  };

  // icons for each HTTP method
  const icons: Record<string, string> = {
    GET: "carbon:document-download",
    POST: "carbon:gateway-mail",
    PUT: "carbon:row-insert",
    DELETE: "carbon:row-delete",
    PATCH: "carbon:edit",
  };

  let working = false;
  let path_being_tested: string = "";
  let method_being_tested: string = "";
  let testing_response: unknown;
  let error_response: unknown;
  let error_cause: string | undefined;

  let testing_params: Record<string, Record<string, any>> = {
    body: {},
    path: {},
    query: {},
  };

  async function testAPI(method: string, endpoint: string) {
    const { body, path, query } = testing_params;
    working = true;
    testing_response = null;
    error_response = null;
    const options: RequestInit = {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const { data, error, statusText } = await SvelteClient.request(
        endpoint,
        method,
        {
          // type: ignore
          body: ["GET"].includes(method) ? undefined : body,
          path: path,
          query: query,
        }
      );
      if (data) {
        testing_response = data;
      } else {
        error_response = statusText;
        error_cause = error;
      }
      // Process the response data
      console.log(data);
      working = false;
    } catch (e) {
      working = false;
      const error = e as {
        message: string;
        cause: string;
      };
      error_response = error.message;
      error_cause = JSON.parse(error.cause).message
        ? JSON.parse(error.cause).message
        : error.cause;
      console.error("Error:", error, error_cause);
    }
  }

  async function loadSchema() {
    schema = await fetch("/apiSchema.json").then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error("Failed to load schema");
      }
    });
  }

  onMount(async () => {
    // listen to ctrl k
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        table_of_contents.showModal();
      }
    });
  });
</script>

{#await loadSchema()}
  <!-- nicely formatted loader -->
  <div
    transition:fly
    class="flex h-screen w-full place-content-center place-items-center"
  >
    <div transition:fly={{ duration: 500 }} class="card bg-base-100 shadow-lg">
      <div class="card-body flex flex-col items-center">
        <div class="text-center">
          <div class="flex items-center justify-center">
            <Icon icon="carbon:api" class="h-6 w-6 animate-spin" />
          </div>
          <h1 class="mt-4 text-2xl font-bold">Svetch API Docs</h1>
          <!-- link to svetch repo -->
          <a
            href="https://github.com/Bewinxed/svetch
"
            class="text-primary underline">Svetch Docs</a
          >
        </div>
      </div>
    </div>
  </div>
{:then}
  {#if schema}
    <dialog
      in:fly|local={{
        x: 50,
        y: 50,
        duration: 300,
        delay: 300,
        easing: quintInOut,
      }}
      out:fly|local={{
        x: -50,
        y: -50,
        duration: 300,
        delay: 300,
        easing: quintInOut,
      }}
      bind:this={table_of_contents}
      class="modal"
    >
      <form method="dialog" class="modal-box">
        <h3 class="mb-2 text-lg font-bold">Table of Contents</h3>
        <ul class="menu rounded-box bg-base-200 lg:min-w-max">
          {#each Object.entries(schema.properties) as [path, methods]}
            {#if methods && methods.properties}
              <li>
                <details open>
                  <summary
                    ><a
                      class="inline-flex place-items-center space-x-2"
                      href="#{path}"
                      ><Icon inline icon="carbon:api" /><span>{path}</span></a
                    ></summary
                  >
                  <ul>
                    {#each Object.keys(methods.properties) as method (method)}
                      <li class="{text_colors[method]} font-bold">
                        <a href="#{path}-{method}"
                          ><Icon icon={icons[method]} />{method}</a
                        >
                      </li>
                    {/each}
                  </ul>
                </details>
              </li>
            {/if}
          {/each}
        </ul>

        <div class="modal-action">
          <!-- if there is a button in form, it will close the modal -->
          <button class="btn">Close</button>
        </div>
      </form>
    </dialog>

    <div class="drawer">
      <input id="my-drawer-3" type="checkbox" class="drawer-toggle" />
      <div class="drawer-content flex flex-col">
        <!-- sticky Navbar -->
        <div class="navbar sticky top-0 z-10 w-full bg-base-300">
          <div class="flex-none lg:hidden">
            <label for="my-drawer-3" class="btn-ghost btn-square btn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                class="inline-block h-6 w-6 stroke-current"
                ><path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                /></svg
              >
            </label>
          </div>
          <div class="mx-2 flex-1 px-2">Svetch Docs</div>
          <div class="hidden flex-none lg:block">
            <ul class="menu menu-horizontal">
              <button
                class="btn-ghost btn"
                on:click={() => table_of_contents.showModal()}
                ><Icon icon="carbon:list" />Quick Jump</button
              >
              <!-- Navbar menu content here -->
              <!-- <li><a>Navbar Item 1</a></li> -->
              <!-- <li><a>Navbar Item 2</a></li> -->
            </ul>
          </div>
        </div>
        <!-- Page content here -->
        <div class="container mx-auto flex flex-col space-y-4">
          <h1 class="my-4 text-2xl font-bold" />
          <p class="text-base-content">Autogenerated from '/api/*'</p>

          {#if schema.properties}
            {#each Object.entries(schema.properties) as [path, paths]}
              <div class="card card-compact w-full bg-base-100 shadow-xl">
                <figure class="h-10">
                  <svg
                    id="patternId"
                    width="100%"
                    height="100%"
                    xmlns="http://www.w3.org/2000/svg"
                    ><defs
                      ><pattern
                        id="a"
                        patternUnits="userSpaceOnUse"
                        width="50.222"
                        height="29.003"
                        patternTransform="scale(3) rotate(50)"
                        ><rect
                          x="0"
                          y="0"
                          width="100%"
                          height="100%"
                          fill="hsla(63,27.8%,71.8%,1)"
                        /><path
                          d="M58.592-14.503h-16.74m6.277 3.627H56.5l4.188 7.25h-8.373zM60.686 3.623l-4.187 7.25h-8.372l4.187-7.25zM41.852-7.252l4.185 7.25-4.185 7.252L37.666 0zm25.11 7.25L58.593 14.5h-16.74L33.481-.001l8.371-14.501m16.74-.001l8.37 14.502m0 0h-16.74v0m-8.37-14.501l8.37 14.502-8.37 14.503M8.371-14.502H-8.37m6.276 3.627h8.371l4.188 7.25H2.093zM10.464 3.624l-4.186 7.25h-8.373l4.187-7.25zM-8.37-7.251L-4.185 0-8.37 7.252-12.556 0zM16.74 0l-8.37 14.502H-8.37L-16.742 0l8.371-14.501m16.74-.001L16.741-.001m0 0H.001v0m-8.37-14.501L0 0l-8.37 14.503m6.275 3.625h8.372l4.187 7.25H2.093zm12.558 14.499l-4.187 7.25h-8.372l4.187-7.25zM-8.371 21.752l4.185 7.25-4.185 7.252-4.185-7.251zm25.112 7.25L8.37 43.504H-8.37l-8.371-14.502 8.37-14.501M8.37 14.5l8.372 14.502m0 0H0v0M-8.37 14.502L0 29.003l-8.37 14.503M48.13 18.127l8.371.001 4.188 7.25h-8.373zm12.557 14.5l-4.187 7.249-8.372.001 4.187-7.25zM41.852 21.751l4.185 7.25-4.185 7.252-4.186-7.252zm25.11 7.25l-8.37 14.502h-16.74L33.48 29.003m25.11-14.503l8.372 14.503m0 0h-16.74v0m-8.371-14.501l8.37 14.501-8.37 14.503M33.482 0h-16.74m6.276 3.627l8.371.001 4.188 7.25h-8.373zm12.557 14.5l-4.187 7.249-8.372.001 4.187-7.25zM16.741 7.25l4.185 7.25-4.185 7.252-4.186-7.252zm25.11 7.25l-8.37 14.502h-16.74m25.11-14.502h-16.74v0M16.742 0l8.37 14.502-8.37 14.503"
                          stroke-linecap="square"
                          stroke-width="3"
                          stroke="hsla(353,22.4%,22.7%,1)"
                          fill="none"
                        /></pattern
                      ></defs
                    ><rect
                      width="800%"
                      height="800%"
                      transform="translate(0,0)"
                      fill="url(#a)"
                    /></svg
                  >
                </figure>
                <div class="card-body">
                  <div
                    id={path}
                    class="card-title w-full rounded-lg border border-black p-2 text-xl shadow-xl"
                  >
                    <Icon class="inline" inline icon="carbon:folders" />
                    {#each path.split("/") as path_part}
                      {"/"}
                      {#if path_part.includes(":")}
                        <div
                          class="badge badge-lg rounded-md bg-gray-500 text-white"
                        >
                          {path_part.replace(":", "")}
                        </div>
                      {:else}
                        <span class="text-base font-semibold">{path_part}</span>
                      {/if}
                    {/each}
                  </div>
                  {#if paths && paths.properties}
                    {#each Object.entries(paths.properties) as [method, method_data]}
                      <div class="md:ml-2">
                        <Collapsible>
                          <svelte:fragment slot="title">
                            <div
                              class="inline-flex place-items-center space-x-2"
                            >
                              <div
                                id="{path}-{method}"
                                class="badge {colors[
                                  method
                                ]} badge-lg gap-2 text-white"
                              >
                                <Icon icon={icons[method]} />
                                {method}
                              </div>
                              {#if method_data.description}
                                <div class="text-sm font-normal italic">
                                  {method_data.description}
                                </div>
                              {/if}
                            </div>
                          </svelte:fragment>
                          <div class="flex flex-col space-y-2">
                            {#if typeof method_data === "object" && method_data.properties && method_data.properties.parameters}
                              {@const parameters =
                                method_data.properties.parameters.properties}
                              {@const responses =
                                method_data.properties.responses}
                              {@const errors = method_data.properties.errors}
                              {@const testing =
                                path_being_tested == path &&
                                method_being_tested == method}
                              {#if parameters}
                                <div class="card-title text-xl font-medium">
                                  <Icon
                                    class="inline"
                                    inline
                                    icon="carbon:parameter"
                                  />
                                  <span>Parameters</span>
                                </div>
                                {#if path_being_tested == path && method_being_tested == method && parameters.path && parameters.path.properties}
                                  <!-- replace the \n with newlines -->
                                  <div class="contents" transition:slide>
                                    <h4 class="text-sm font-normal">
                                      <Icon
                                        class="inline"
                                        inline
                                        icon="carbon:folders"
                                      /> Path
                                    </h4>
                                    <div class="m-2 flex space-x-2">
                                      {#each Object.entries(parameters.path.properties) as [param, type]}
                                        <div class="badge badge-primary gap-2">
                                          {param}
                                        </div>
                                        <input
                                          class="input-primary input"
                                          type="text"
                                          name={param}
                                          id={param}
                                          bind:value={testing_params.path[
                                            param
                                          ]}
                                        />
                                      {/each}
                                    </div>
                                  </div>
                                {/if}
                                <div
                                  class="rounded-lg border border-gray-300 p-2 shadow-inner"
                                >
                                  {#if parameters.body && parameters.body.properties}
                                    <h4 class="text-lg font-semibold">
                                      <Icon
                                        class="inline"
                                        inline
                                        icon="carbon:document-multiple-02"
                                      /> Body
                                    </h4>
                                    <div
                                      class="mockup-code m-2 transition-all {path_being_tested ==
                                        path && method_being_tested
                                        ? 'max-h-60 overflow-auto'
                                        : 'max-h-[50rem]'}"
                                    >
                                      <BodyBlock data={parameters.body} />
                                    </div>
                                  {/if}
                                </div>
                                <!-- if query is not never -->
                                {#if parameters.query && parameters.query.properties && Object.entries(parameters.query.properties).length > 0}
                                  <h4 class="text-base font-semibold">Query</h4>
                                  {JSON.stringify(parameters.query)}
                                  <BodyBlock data={parameters.query} />
                                  <!-- <pre>{JSON.stringify(parameters.query, null, 2)}</pre> -->
                                {/if}
                              {/if}
                              {#if testing && parameters.body && parameters.body.properties}
                                <div class="form-control">
                                  <label class="label" for="body">
                                    <h2 class="label-text">Body</h2>
                                  </label>
                                  <textarea
                                    rows={Object.keys(testing_params.body)
                                      .length + 2}
                                    class="textarea-bordered textarea-primary textarea h-auto"
                                    name="body"
                                    id="body"
                                    value={JSON.stringify(
                                      testing_params.body,
                                      null,
                                      "\t"
                                    )}
                                    on:input={(e) => {
                                      try {
                                        testing_params.body = JSON.parse(
                                          e.target.value
                                        );
                                      } catch (e) {
                                        console.error(e);
                                      }
                                    }}
                                  />
                                </div>
                              {/if}

                              {#if responses && responses.properties}
                                <Collapsible
                                  open={!testing}
                                  title="Responses"
                                  icon="carbon:package"
                                >
                                  {#each Object.entries(responses.properties) as [code, response]}
                                    <div class="ml-2">
                                      <h4 class="text-sm font-normal">
                                        <Icon
                                          class="inline"
                                          inline
                                          icon="carbon:document-multiple"
                                        />
                                        <div
                                          class="badge {parseInt(code) <= 100
                                            ? 'badge-info'
                                            : parseInt(code) <= 200
                                            ? 'badge-success'
                                            : parseInt(code) <= 300
                                            ? 'badge-warning'
                                            : parseInt(code) <= 400
                                            ? 'badge-error'
                                            : 'badge-error'}"
                                        >
                                          {parseInt(code)}
                                        </div>
                                      </h4>
                                      <div
                                        class="mockup-code m-2 transition-all {testing
                                          ? 'max-h-60 overflow-auto'
                                          : 'max-h-[50rem]'}"
                                      >
                                        <BodyBlock data={response} />
                                      </div>
                                    </div>
                                  {/each}
                                </Collapsible>
                              {/if}
                              {#if errors && errors.properties}
                                <Collapsible
                                  open={!testing}
                                  title="Errors"
                                  icon="carbon:error-outline"
                                >
                                  {#each Object.entries(errors.properties) as [code, response]}
                                    <div class="ml-2">
                                      <h4 class="text-sm font-normal">
                                        <Icon
                                          class="inline"
                                          inline
                                          icon="carbon:document-multiple"
                                        />
                                        <div
                                          class="badge {parseInt(code) <= 100
                                            ? 'badge-info'
                                            : parseInt(code) <= 200
                                            ? 'badge-success'
                                            : parseInt(code) <= 300
                                            ? 'badge-warning'
                                            : parseInt(code) <= 400
                                            ? 'badge-error'
                                            : 'badge-error'}"
                                        >
                                          {parseInt(code)}
                                        </div>
                                      </h4>
                                      <div
                                        class="mockup-code m-2 transition-all {path_being_tested ==
                                          path && method_being_tested
                                          ? 'max-h-60 overflow-auto'
                                          : 'max-h-[50rem]'}"
                                      >
                                        <BodyBlock data={response} />
                                      </div>
                                    </div>
                                  {/each}
                                </Collapsible>
                              {/if}

                              {#if path_being_tested === path && method_being_tested === method}
                                <div class="" transition:slide>
                                  {#if error_response}
                                    <span
                                      class="mb-1 inline-flex flex-row place-items-center space-x-2"
                                      in:fly={{
                                        x: 50,
                                        duration: 200,
                                        delay: 200,
                                      }}
                                      out:fly={{ x: -25, duration: 200 }}
                                    >
                                      <Icon
                                        icon="carbon:error"
                                        class="text-error"
                                      />
                                      <div
                                        class="mockup-code"
                                        transition:slide={{ duration: 200 }}
                                      >
                                        <pre class="text-error"><code
                                            >{JSON.stringify(
                                              error_response,
                                              null,
                                              2
                                            )}</code
                                          ></pre>
                                      </div>
                                    </span>
                                    {#if error_cause}
                                      <div
                                        class="mockup-code"
                                        transition:slide={{ duration: 200 }}
                                      >
                                        <pre class="text-error"><code
                                            >{JSON.stringify(
                                              error_cause,
                                              null,
                                              2
                                            )}</code
                                          ></pre>
                                      </div>
                                    {/if}
                                  {:else if testing_response}
                                    <span
                                      class="inline-flex flex-row place-items-center space-x-2"
                                      in:fly={{
                                        x: 50,
                                        duration: 200,
                                        delay: 200,
                                      }}
                                      out:fly={{ x: -25, duration: 200 }}
                                    >
                                      <Icon
                                        icon="carbon:checkmark"
                                        class="text-success"
                                      />
                                      Success!
                                    </span>
                                    <div
                                      class="mockup-code w-full"
                                      transition:slide={{ duration: 200 }}
                                    >
                                      <pre
                                        class="whitespace-pre-wrap break-words"><code
                                          >{JSON.stringify(
                                            testing_response,
                                            null,
                                            "\t"
                                          )}</code
                                        ></pre>
                                    </div>
                                  {:else if working}
                                    <span
                                      class="inline-flex flex-row place-items-center space-x-2"
                                      in:fly={{
                                        x: 50,
                                        duration: 200,
                                        delay: 200,
                                      }}
                                      out:fly={{ x: -25, duration: 200 }}
                                    >
                                      <Icon
                                        icon="carbon:circle-dash"
                                        class="animate-spin"
                                      />
                                      <span>Testing...</span>
                                    </span>
                                  {/if}
                                </div>
                              {/if}

                              <div class="card-actions justify-end">
                                <button
                                  class="btn-secondary btn"
                                  on:click={() => {
                                    // set focus to the first input

                                    if (
                                      path_being_tested !== path ||
                                      method_being_tested !== method
                                    ) {
                                      testing_response = null;
                                      error_response = null;
                                      error_cause = "";
                                    }
                                    path_being_tested = path;
                                    method_being_tested = method;
                                    if (
                                      parameters?.body &&
                                      parameters?.body.properties
                                    ) {
                                      testing_params.body = Object.entries(
                                        parameters.body.properties
                                      ).reduce((acc, [key, value]) => {
                                        if (value.type == "number") {
                                          acc[key] = 0;
                                        } else if (value.type == "boolean") {
                                          acc[key] = false;
                                        } else if (value.type == "string") {
                                          if (
                                            value.format &&
                                            value.format == "date-time"
                                          ) {
                                            acc[key] = new Date().toISOString();
                                          } else if (
                                            value.format &&
                                            value.format == "date"
                                          ) {
                                            acc[key] = new Date().toISOString();
                                          } else {
                                            acc[key] = "";
                                          }
                                        } else if (value.type == "array") {
                                          acc[key] = [];
                                        } else if (value.type == "object") {
                                          acc[key] = {};
                                        } else if (value.type == "date") {
                                          acc[key] = new Date().toISOString();
                                        } else if (value.type == "date-time") {
                                          acc[key] = new Date().toISOString();
                                        } else {
                                          acc[key] = null;
                                        }
                                        return acc;
                                      }, {});
                                    }
                                    const firstInput = document.getElementById(
                                      `${path}-${method}`
                                    );
                                    if (firstInput) {
                                      // delay to allow the collapsible to open
                                      window.scrollTo({
                                        top: firstInput.offsetTop - 100,
                                        behavior: "smooth",
                                      });
                                    }
                                  }}>Try</button
                                >
                                <button
                                  class="btn-primary btn"
                                  on:click={() => testAPI(method, path)}
                                  >Test</button
                                >
                              </div>
                            {/if}
                          </div>
                        </Collapsible>
                      </div>
                    {/each}
                  {/if}
                </div>
              </div>
            {/each}
          {/if}
        </div>
      </div>
      <div class="drawer-side">
        <label for="my-drawer-3" class="drawer-overlay" />

        <ul class="menu mt-16 h-full w-fit bg-base-200">
          {#each Object.entries(schema.properties) as [path, methods]}
            {#if methods && methods.properties}
              <li>
                <details open>
                  <summary
                    ><a
                      class="inline-flex place-items-center space-x-2"
                      href="#{path}"
                      ><Icon inline icon="carbon:api" /><span>{path}</span></a
                    ></summary
                  >
                  <ul>
                    {#each Object.keys(methods.properties) as method (method)}
                      <li class="{text_colors[method]} font-bold">
                        <a href="#{path}-{method}"
                          ><Icon icon={icons[method]} />{method}</a
                        >
                      </li>
                    {/each}
                  </ul>
                </details>
              </li>
            {/if}
          {/each}
        </ul>
      </div>
    </div>
    <footer class="p-10 footer bg-base-200 text-base-content footer-center">
      <div>
        <span class="footer-title">Autogenerated Docs via Svetch</span>
        <a
          href="https://github.com/Bewinxed/svetch
"
          class="text-primary underline">Svetch Docs</a
        >
      </div>
    </footer>
  {/if}
{:catch error}
  <div class="flex h-screen w-full place-content-center place-items-center">
    <div transition:fly={{ duration: 500 }} class="card bg-base-100 shadow-lg">
      <div class="card-body flex flex-col items-center">
        <div class="text-center">
          <div class="flex items-center justify-center">
            <Icon icon="carbon:error" class="text-5xl text-error" />
          </div>
          <h1 class="mt-4 text-2xl font-bold">Error</h1>
          <p class="mt-2 text-base-content text-opacity-60">{error.message}</p>
        </div>
      </div>
    </div>
  </div>
{/await}

<style>
  :global(html) {
    scroll-behavior: smooth;
  }
</style>
