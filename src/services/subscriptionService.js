import api from "@/api";

export const getSubscriptionByUserId = async (userId, token) => {
  try {
    const response = await api.get(`/users/${userId}/subscription`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return null;
  }
};

export const subscribeUser = async (userId, planType, durationMonths, token, selectedTemplates) => {
  try {
    const payload = {
      plan_type: planType,
      duration_months: durationMonths,
      status: "active",
    };

    // If templates are provided (numeric array), include them so backend can save both plan and templates together
    if (Array.isArray(selectedTemplates) && selectedTemplates.length > 0) {
      payload.selected_templates = selectedTemplates;
    }

    const response = await api.post(`/users/${userId}/subscription`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw error;
  }
};

export const updateSubscriptionTemplates = async (userId, selectedTemplates, token, subscriptionId, planType) => {
  // Try multiple possible endpoints/methods to be resilient to backend routing differences
  const payload = { selected_templates: selectedTemplates };
  if (planType) payload.plan_type = planType;
  const headers = { headers: { Authorization: `Bearer ${token}` } };

  // 1) PATCH /users/:userId/subscription
  try {
    const res = await api.patch(`/users/${userId}/subscription`, payload, headers);
    return res.data;
  } catch (err) {
    if (!err.response || err.response.status !== 404) {
      console.error("Error updating subscription templates (users patch):", err);
      // For non-404 errors, rethrow to let caller show meaningful message
      throw err;
    }
  }

  // 2) Try PUT /users/:userId/subscription
  try {
    const res = await api.put(`/users/${userId}/subscription`, payload, headers);
    return res.data;
  } catch (err) {
    if (!err.response || err.response.status !== 404) {
      console.error("Error updating subscription templates (users put):", err);
      throw err;
    }
  }

  // 3) If subscriptionId is available, try patching /subscriptions/:subscriptionId
  if (subscriptionId) {
    try {
      const res = await api.patch(`/subscriptions/${subscriptionId}`, payload, headers);
      return res.data;
    } catch (err) {
      if (!err.response || err.response.status !== 404) {
        console.error("Error updating subscription templates (subscriptions patch):", err);
        throw err;
      }
    }

    try {
      const res = await api.put(`/subscriptions/${subscriptionId}`, payload, headers);
      return res.data;
    } catch (err) {
      if (!err.response || err.response.status !== 404) {
        console.error("Error updating subscription templates (subscriptions put):", err);
        throw err;
      }
    }
  }

  // 4) Last attempt: POST /users/:userId/subscription/templates (some APIs expect a nested resource)
  try {
    const res = await api.post(`/users/${userId}/subscription/templates`, payload, headers);
    return res.data;
  } catch (err) {
    console.error("All attempts to update subscription templates failed:", err);
    throw err;
  }
};

export default {
  getSubscriptionByUserId,
  subscribeUser,
  updateSubscriptionTemplates,
};
