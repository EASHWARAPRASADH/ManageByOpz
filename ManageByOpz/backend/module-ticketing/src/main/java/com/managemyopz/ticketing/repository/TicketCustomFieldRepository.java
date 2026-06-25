package com.managemyopz.ticketing.repository;

import com.managemyopz.ticketing.entity.TicketCustomField;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TicketCustomFieldRepository extends JpaRepository<TicketCustomField, Long> {
    List<TicketCustomField> findByTicketId(String ticketId);
    void deleteByTicketId(String ticketId);
}
