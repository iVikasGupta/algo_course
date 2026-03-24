const API_URL = "http://localhost:5000/api";

// Helper to get auth token
const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  // Auth APIs
  async signUp(name: string, email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Signup failed");
    }
    return data;
  },

  async signIn(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }
    return data;
  },

  async getMe() {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        ...getAuthHeader(),
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to get user");
    }
    return data;
  },

  async forgotPassword(email: string) {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to send reset email");
    }
    return data;
  },

  async resetPassword(token: string, password: string) {
    const response = await fetch(`${API_URL}/auth/reset-password/${token}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to reset password");
    }
    return data;
  },

  // Course APIs
  async getCourses() {
    const response = await fetch(`${API_URL}/courses`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch courses");
    }
    return data;
  },

  async getCourse(id: string) {
    const response = await fetch(`${API_URL}/courses/${id}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch course");
    }
    return data;
  },

  // Enrollment APIs
  async enrollCourse(courseId: string) {
    const response = await fetch(`${API_URL}/enrollments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify({ course_id: courseId }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to enroll");
    }
    return data;
  },

  async getMyEnrollments() {
    const response = await fetch(`${API_URL}/enrollments/my-courses`, {
      headers: {
        ...getAuthHeader(),
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch enrollments");
    }
    return data;
  },

  async checkEnrollment(courseId: string) {
    const response = await fetch(`${API_URL}/enrollments/check/${courseId}`, {
      headers: {
        ...getAuthHeader(),
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to check enrollment");
    }
    return data;
  },

  async updateProgress(courseId: string, progress: number) {
    const response = await fetch(`${API_URL}/enrollments/progress/${courseId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify({ progress_percentage: progress }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to update progress");
    }
    return data;
  },

  // Lesson APIs
  async getLessonsByCourse(courseId: string) {
    const response = await fetch(`${API_URL}/lessons/course/${courseId}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch lessons");
    }
    return data;
  },

  async getLessonVideo(lessonId: string) {
    const response = await fetch(`${API_URL}/lessons/${lessonId}`, {
      headers: {
        ...getAuthHeader(),
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch lesson video");
    }
    return data;
  },

  async createLesson(lessonData: {
    course_id: string;
    title: string;
    vimeo_video_id: string;
    order: number;
    is_free_preview?: boolean;
  }) {
    const response = await fetch(`${API_URL}/lessons`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(lessonData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to create lesson");
    }
    return data;
  },

  // Stats APIs
  async getUserStats() {
    const response = await fetch(`${API_URL}/enrollments/stats`, {
      headers: {
        ...getAuthHeader(),
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch stats");
    }
    return data;
  },

  // Lesson Progress APIs
  async updateLessonProgress(data: {
    lesson_id: string;
    course_id: string;
    is_completed?: boolean;
    time_spent_seconds?: number;
    last_position_seconds?: number;
  }) {
    const response = await fetch(`${API_URL}/enrollments/lesson-progress`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Failed to update lesson progress");
    }
    return result;
  },

  async getLessonProgress(courseId: string) {
    const response = await fetch(`${API_URL}/enrollments/lesson-progress/${courseId}`, {
      headers: {
        ...getAuthHeader(),
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch lesson progress");
    }
    return data;
  },

  async completeLesson(lessonId: string, courseId: string) {
    const response = await fetch(`${API_URL}/enrollments/complete-lesson`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify({ lesson_id: lessonId, course_id: courseId }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to complete lesson");
    }
    return data;
  },

  // Scripts APIs
  async getScripts() {
    const response = await fetch(`${API_URL}/scripts`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch scripts");
    }
    return data;
  },

  async getScript(id: string) {
    const response = await fetch(`${API_URL}/scripts/${id}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch script");
    }
    return data;
  },

  async purchaseScript(scriptId: string) {
    const response = await fetch(`${API_URL}/scripts/${scriptId}/purchase`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to purchase script");
    }
    return data;
  },

  async checkScriptPurchase(scriptId: string) {
    const response = await fetch(`${API_URL}/scripts/${scriptId}/check-purchase`, {
      headers: {
        ...getAuthHeader(),
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to check script purchase");
    }
    return data;
  },

  async getMyPurchasedScripts() {
    const response = await fetch(`${API_URL}/scripts/user/purchased`, {
      headers: {
        ...getAuthHeader(),
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch purchased scripts");
    }
    return data;
  },

  async downloadScript(scriptId: string) {
    const response = await fetch(`${API_URL}/scripts/${scriptId}/download`, {
      headers: {
        ...getAuthHeader(),
      },
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to download script");
    }
    return response;
  },
};
