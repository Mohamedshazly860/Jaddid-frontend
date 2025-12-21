import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCircle, BellOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.get("/community/notifications/").then((res) => res.data),
    enabled: !!user,
  });

  const notifications = data?.results || data || [];

  const markRead = useMutation({
    mutationFn: (id) =>
      api.post(`/community/notifications/${id}/mark_as_read/`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notifications-count"] });
    },
  });

  if (isLoading)
    return <p className="p-6 text-center">Loading notifications...</p>;

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="flex gap-2 items-center">
            <Bell className="w-5 h-5 text-forest" />
            Notifications
          </CardTitle>
          <Badge variant="secondary">{notifications.length}</Badge>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <BellOff className="mx-auto mb-2 opacity-30" />
                No notifications
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex justify-between p-4 border-b ${
                    !n.is_read ? "bg-orange/5" : ""
                  }`}
                >
                  <div>
                    <p
                      className={`text-sm ${!n.is_read ? "font-semibold" : ""}`}
                    >
                      {n.message}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(n.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {!n.is_read && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => markRead.mutate(n.id)}
                    >
                      <CheckCircle className="w-4 h-4 text-forest" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
