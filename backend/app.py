from flask import Flask, jsonify, request
from flask_cors import CORS
import numpy as np

app = Flask(__name__)
CORS(app)

AHP_WEIGHTS = np.array([0.4009, 0.2459, 0.1664, 0.1278, 0.0589])

@app.route('/api/ahp-borda/calculate', methods=['POST'])
def calculate_ahp_borda():
    data = request.json
    alternatives = data.get('alternatives', [])
    
    if not alternatives or len(alternatives) < 2:
        return jsonify({"status": "error", "message": "Minimal butuh 2 Pokémon untuk dibandingkan"}), 400

    clean_scores = []
    for alt in alternatives:
        scores = alt.get('scores', [])

        if len(scores) < 5:
            scores.extend([1] * (5 - len(scores)))
        clean_scores.append(scores[:5])

    num_alts = len(alternatives)
    matrix = np.array(clean_scores, dtype=float)
    borda_matrix = np.zeros_like(matrix)

    for j in range(matrix.shape[1]):
        col = matrix[:, j]
        sorted_idx = np.argsort(col)[::-1]
        
        current_point = num_alts
        for i in range(num_alts):
            if i > 0 and col[sorted_idx[i]] == col[sorted_idx[i-1]]:
                borda_matrix[sorted_idx[i], j] = borda_matrix[sorted_idx[i-1], j]
            else:
                borda_matrix[sorted_idx[i], j] = current_point
            current_point -= 1

    final_scores = np.dot(borda_matrix, AHP_WEIGHTS)

    results = []
    for i, alt in enumerate(alternatives):
        results.append({
            "nama_pokemon": alt['name'],
            "borda_points": borda_matrix[i].tolist(),
            "nilai_akhir": float(final_scores[i])
        })

    results.sort(key=lambda x: x['nilai_akhir'], reverse=True)
    
    for index, res in enumerate(results):
        res['ranking'] = index + 1
        
    return jsonify({
        "status": "success",
        "data": results
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)