package com.managemyopz.leave.service;

import com.managemyopz.leave.entity.LeaveBalance;
import org.springframework.stereotype.Service;

@Service
public class LeaveBalanceCalculator {

    public double calculateAvailable(LeaveBalance balance) {
        if (balance == null) return 0.0;
        return balance.getTotalAllocated() + balance.getCarriedForward() - balance.getTotalPending() - balance.getTotalUsed();
    }

    public void reserveBalance(LeaveBalance balance, double days) {
        balance.setTotalPending(balance.getTotalPending() + days);
        balance.setBalance(calculateAvailable(balance));
    }

    public void consumeBalance(LeaveBalance balance, double days) {
        balance.setTotalPending(Math.max(0.0, balance.getTotalPending() - days));
        balance.setTotalUsed(balance.getTotalUsed() + days);
        balance.setBalance(calculateAvailable(balance));
    }

    public void releaseBalance(LeaveBalance balance, double days, boolean isApproved) {
        if (isApproved) {
            balance.setTotalUsed(Math.max(0.0, balance.getTotalUsed() - days));
        } else {
            balance.setTotalPending(Math.max(0.0, balance.getTotalPending() - days));
        }
        balance.setBalance(calculateAvailable(balance));
    }

    public void recalculate(LeaveBalance balance) {
        balance.setBalance(calculateAvailable(balance));
    }
}
