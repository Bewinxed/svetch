export const actions: Actions = {
    edit_profile: async ({ request, locals, fetch }) => {
		const session = await locals.auth.validate()

		if (!session) {
			return fail(401, { message: "You're not logged in" })
		}

		const data = await request.formData()

        const payload = {
            age: parseInt(data.get('age') as string) || undefined,
            gender: (data.get('gender') as string) || undefined,
            height: parseInt(data.get('height') as string) || undefined,
            weight: parseInt(data.get('weight') as string) || undefined,
            activityLevel: (data.get('activity_level') as string) || undefined,
            goal: (data.get('goal') as string) || undefined,
            goalWeight: parseInt(data.get('goal_weight') as string) || undefined,
            allergies: {
                createMany: {
                    data: ((data.get('allergies') as string) ?? '').split(',').map((allergy) => {
                        return {
                            name: allergy
                        }
                    })
                }
            },
            comorbidities: {
                createMany: {
                    data: ((data.get('comorbidities') as string) ?? '').split(',').map((comorbidity) => {
                        return {
                            name: comorbidity
                        }
                    })
                }
            }
        }

		return {
            status: 200,
            body: {
                message: 'Profile updated successfully',
            }
        }
	}
};