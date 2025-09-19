from rest_framework.permissions import BasePermission


class IsEventOwner(BasePermission):
    """
    Permission to check if user is the owner of the event.
    Only event owners can perform certain actions like adding/removing co-hosts.
    """
    
    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user


class IsEventOwnerOrCoHost(BasePermission):
    """
    Permission to check if user is either the owner or a co-host of the event.
    Both owners and co-hosts can edit/update/delete events.
    """
    
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        if obj.owner == request.user:
            return True
        
        return obj.cohosts.filter(user=request.user).exists()


class IsEventOwnerOrCoHostOrReadOnly(BasePermission):
    """
    Permission that allows read-only access to everyone,
    but only allows write access to event owners and co-hosts.
    """
    
    def has_permission(self, request, view):
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        
        if not request.user.is_authenticated:
            return False
        
        if obj.owner == request.user:
            return True
        
        return obj.cohosts.filter(user=request.user).exists()