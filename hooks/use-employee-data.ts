import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getDocuments } from "@/lib/firebase/firestore";
import { where } from "firebase/firestore";
import { getCurrentUser } from "@/lib/firebase/auth";

export interface EmployeeData {
  id: string;
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  eid?: string;
  designation?: string;
  department?: string;
  profileImageUrl?: string;
  supervisor_id?: string;
  auth_uid?: string;
  [key: string]: any;
}

export function useEmployeeData() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["employee-data"],
    queryFn: async (): Promise<EmployeeData | null> => {
      const user = getCurrentUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data: employees, error } = await getDocuments("employees", [
        where("auth_uid", "==", user.uid)
      ]);

      if (error) {
        throw error;
      }

      if (!employees || employees.length === 0) {
        return null;
      }

      return employees[0] as EmployeeData;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

export function useSupervisorStatus(employeeId?: string) {
  return useQuery({
    queryKey: ["supervisor-status", employeeId],
    queryFn: async () => {
      if (!employeeId) return { isSupervisor: false, supervisedCount: 0 };

      const { data: supervisedEmployees } = await getDocuments("employees", [
        where("supervisor_id", "==", employeeId)
      ]);

      return {
        isSupervisor: (supervisedEmployees && supervisedEmployees.length > 0) || false,
        supervisedCount: supervisedEmployees?.length || 0,
      };
    },
    enabled: !!employeeId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

export function useAssignmentSupervisorStatus(employeeId?: string) {
  return useQuery({
    queryKey: ["assignment-supervisor-status", employeeId],
    queryFn: async () => {
      if (!employeeId) return { isAssignmentSupervisor: false, assignmentsCount: 0 };

      const { data: supervisedAssignments } = await getDocuments("assignments", [
        where("supervisor_id", "==", employeeId)
      ]);

      return {
        isAssignmentSupervisor: (supervisedAssignments && supervisedAssignments.length > 0) || false,
        assignmentsCount: supervisedAssignments?.length || 0,
      };
    },
    enabled: !!employeeId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

export function useLeaveBalance(employeeId?: string) {
  return useQuery({
    queryKey: ["leave-balance", employeeId],
    queryFn: async () => {
      if (!employeeId) return null;

      const { data: leaveBalances } = await getDocuments("leave_balances", [
        where("employee_id", "==", employeeId)
      ]);

      return leaveBalances && leaveBalances.length > 0 ? leaveBalances[0] : null;
    },
    enabled: !!employeeId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5,
  });
}
