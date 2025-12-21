import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import { useNavigate } from "react-router-dom";
import { Star, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Reviews() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const { data, isLoading } = useQuery({
    queryKey: ["reviews"],
    queryFn: () => api.get("/community/reviews/").then((r) => r.data),
    enabled: !!user,
  });

  const reviews = data?.results || data || [];

  const createReview = useMutation({
    mutationFn: () => api.post("/community/reviews/", { rating, comment }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews"] });
      setComment("");
      setRating(5);
    },
  });

  return (
    <div className="container mx-auto max-w-3xl p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                onClick={() => setRating(s)}
                className={`cursor-pointer ${
                  s <= rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>

          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your review..."
          />

          <Button
            onClick={() => createReview.mutate()}
            disabled={!comment || createReview.isPending}
          >
            Post Review <Send className="ml-2 w-4 h-4" />
          </Button>
        </CardContent>
      </Card>

      {isLoading ? (
        <p>Loading reviews...</p>
      ) : (
        reviews.map((r) => (
          <Card key={r.id}>
            <CardContent className="flex gap-4 p-4">
              <Avatar>
                <AvatarFallback>{r.user_name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{r.user_name || "User"}</p>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < r.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">{r.comment}</p>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
