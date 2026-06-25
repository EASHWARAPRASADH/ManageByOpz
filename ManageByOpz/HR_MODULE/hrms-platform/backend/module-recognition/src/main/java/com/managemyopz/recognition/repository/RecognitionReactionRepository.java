package com.managemyopz.recognition.repository;

import com.managemyopz.recognition.entity.RecognitionReaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RecognitionReactionRepository extends JpaRepository<RecognitionReaction, UUID> {
    List<RecognitionReaction> findByRecognitionId(UUID recognitionId);
    Optional<RecognitionReaction> findByRecognitionIdAndEmployeeIdAndReactionType(
            UUID recognitionId, UUID employeeId, RecognitionReaction.ReactionType reactionType);
}
