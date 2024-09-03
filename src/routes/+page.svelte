<script lang="ts">
	import { Svetch } from "../lib/api/client.js";

    const svetch = new Svetch()

    const result = svetch.post("/api/prisma/:id", {
        path: {
            id: "1"
        },
        body: {
        }
    }).then((res) => res.okOrThrow())
</script>