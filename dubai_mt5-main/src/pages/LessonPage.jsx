import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import VimeoPlayer from "../components/VimeoPlayer";

const LessonPage = () => {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`http://localhost:5000/api/lessons/${lessonId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setLesson(data));
  }, [lessonId]);

  if (!lesson) return <p>Loading...</p>;

  return (
    <div>
      <h2>{lesson.title}</h2>
      <VimeoPlayer videoId={lesson.vimeo_video_id} />
    </div>
  );
};

export default LessonPage;
