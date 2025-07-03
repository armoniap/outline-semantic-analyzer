export function cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) {
        throw new Error('Invalid vectors for cosine similarity calculation');
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    
    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    
    if (magnitude === 0) {
        return 0;
    }
    
    return dotProduct / magnitude;
}

export function calculateDistance(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) {
        throw new Error('Invalid vectors for distance calculation');
    }
    
    let sum = 0;
    for (let i = 0; i < vecA.length; i++) {
        sum += Math.pow(vecA[i] - vecB[i], 2);
    }
    
    return Math.sqrt(sum);
}

export function normalizeVector(vector) {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    
    if (magnitude === 0) {
        return new Array(vector.length).fill(0);
    }
    
    return vector.map(val => val / magnitude);
}

export function averageVectors(vectors) {
    if (!vectors || vectors.length === 0) {
        return [];
    }
    
    const length = vectors[0].length;
    const result = new Array(length).fill(0);
    
    for (const vector of vectors) {
        for (let i = 0; i < length; i++) {
            result[i] += vector[i];
        }
    }
    
    return result.map(val => val / vectors.length);
}

export function findMostSimilar(targetVector, candidateVectors) {
    let maxSimilarity = -1;
    let mostSimilarIndex = -1;
    
    for (let i = 0; i < candidateVectors.length; i++) {
        const similarity = cosineSimilarity(targetVector, candidateVectors[i]);
        if (similarity > maxSimilarity) {
            maxSimilarity = similarity;
            mostSimilarIndex = i;
        }
    }
    
    return {
        index: mostSimilarIndex,
        similarity: maxSimilarity
    };
}